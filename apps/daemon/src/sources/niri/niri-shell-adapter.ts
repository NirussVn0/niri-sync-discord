import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface NiriOutputMode {
  width: number;
  height: number;
  refresh_rate: number;
  is_preferred: boolean;
}

export interface NiriOutputInfo {
  name: string;
  make: string;
  model: string;
  serial: string;
  physical_size: [number, number];
  modes: NiriOutputMode[];
  current_mode: number;
  is_custom_mode: boolean;
  vrr_supported: boolean;
  vrr_enabled: boolean;
  logical: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    transform: string;
  };
}

export interface NiriWorkspaceInfo {
  id: number;
  idx: number;
  name: string | null;
  output: string | null;
  is_urgent: boolean;
  is_active: boolean;
  is_focused: boolean;
  active_window_id: number | null;
}

export class NiriShellAdapter {
  private focusedOutput: string | null = null;
  private outputs: Map<string, NiriOutputInfo> = new Map();
  private workspaces: NiriWorkspaceInfo[] = [];
  private isOverviewActive: boolean = false;

  /**
   * Refreshes the active Niri outputs and workspaces from Niri IPC.
   */
  public async refreshState(): Promise<{
    focusedOutput: string | null;
    outputs: NiriOutputInfo[];
    workspaces: NiriWorkspaceInfo[];
  }> {
    try {
      const [outputsRes, workspacesRes] = await Promise.all([
        execFileAsync("niri", ["msg", "--json", "outputs"]).catch(() => ({ stdout: "{}" })),
        execFileAsync("niri", ["msg", "--json", "workspaces"]).catch(() => ({ stdout: "[]" })),
      ]);

      const parsedOutputs = JSON.parse(outputsRes.stdout || "{}") as Record<string, NiriOutputInfo>;
      this.outputs.clear();
      for (const [name, info] of Object.entries(parsedOutputs)) {
        this.outputs.set(name, info);
      }

      this.workspaces = JSON.parse(workspacesRes.stdout || "[]") as NiriWorkspaceInfo[];

      // Determine focused output from focused workspace
      const focusedWorkspace = this.workspaces.find((w) => w.is_focused);
      if (focusedWorkspace && focusedWorkspace.output) {
        this.focusedOutput = focusedWorkspace.output;
      } else if (this.outputs.size > 0) {
        this.focusedOutput = Array.from(this.outputs.keys())[0] ?? null;
      }

      return {
        focusedOutput: this.focusedOutput,
        outputs: Array.from(this.outputs.values()),
        workspaces: this.workspaces,
      };
    } catch {
      return {
        focusedOutput: this.focusedOutput,
        outputs: Array.from(this.outputs.values()),
        workspaces: this.workspaces,
      };
    }
  }

  public getFocusedOutput(): string | null {
    return this.focusedOutput;
  }

  public getOutputs(): NiriOutputInfo[] {
    return Array.from(this.outputs.values());
  }

  public getWorkspaces(): NiriWorkspaceInfo[] {
    return this.workspaces;
  }

  public setOverviewActive(active: boolean): void {
    this.isOverviewActive = active;
  }

  public isOverview(): boolean {
    return this.isOverviewActive;
  }
}
