import { z } from "zod";

export const NiriWindowSchema = z.object({
  id: z.number(),
  title: z.string().nullable().optional(),
  app_id: z.string().nullable().optional(),
  workspace_id: z.number().nullable().optional(),
  is_focused: z.boolean().optional(),
});
export type NiriWindow = z.infer<typeof NiriWindowSchema>;

export const NiriWorkspaceSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  idx: z.number().optional(),
  is_active: z.boolean().optional(),
  is_focused: z.boolean().optional(),
  active_window_id: z.number().nullable().optional(),
});
export type NiriWorkspace = z.infer<typeof NiriWorkspaceSchema>;

// Individual event payloads
export const NiriWorkspacesChangedEvent = z.object({
  WorkspacesChanged: z.object({
    workspaces: z.array(NiriWorkspaceSchema),
  }),
});

export const NiriWorkspaceActivatedEvent = z.object({
  WorkspaceActivated: z.object({
    id: z.number(),
    focused: z.boolean().optional(),
  }),
});

export const NiriWindowsChangedEvent = z.object({
  WindowsChanged: z.object({
    windows: z.array(NiriWindowSchema),
  }),
});

export const NiriWindowOpenedOrChangedEvent = z.object({
  WindowOpenedOrChanged: z.object({
    window: NiriWindowSchema,
  }),
});

export const NiriWindowClosedEvent = z.object({
  WindowClosed: z.object({
    id: z.number(),
  }),
});

export const NiriWindowFocusChangedEvent = z.object({
  WindowFocusChanged: z.object({
    id: z.number().nullable(),
  }),
});

export const NiriWorkspaceActiveWindowChangedEvent = z.object({
  WorkspaceActiveWindowChanged: z.object({
    workspace_id: z.number(),
    active_window_id: z.number().nullable(),
  }),
});
