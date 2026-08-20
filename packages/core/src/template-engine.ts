import { TemplateVariables, RpcTemplate } from "@presenced/contracts";

export interface RenderedTemplate {
  details: string;
  state?: string | undefined;
  largeText?: string | undefined;
  smallText?: string | undefined;
}

export class TemplateEngine {
  private static TOKEN_REGEX = /\{([a-zA-Z0-9_.]+)\}/g;

  /**
   * Evaluates a template string by substituting tokens against provided variables.
   */
  public renderString(template: string, vars: TemplateVariables): string {
    if (!template) return "";

    const rendered = template.replace(TemplateEngine.TOKEN_REGEX, (match, token: string) => {
      const val = this.resolveToken(token, vars);
      return val != null ? String(val) : "";
    });

    // Clean up multiple spaces or hanging separators like " — " when a token is missing
    return rendered
      .replace(/\s+/g, " ")
      .replace(/^\s*—\s*/, "")
      .replace(/\s*—\s*$/, "")
      .replace(/^\s*•\s*/, "")
      .replace(/\s*•\s*$/, "")
      .trim();
  }

  /**
   * Renders full RPC template fields.
   */
  public renderTemplate(template: RpcTemplate, vars: TemplateVariables): RenderedTemplate {
    const details = this.renderString(template.detailsTemplate, vars);
    const state = template.stateTemplate ? this.renderString(template.stateTemplate, vars) : undefined;
    const largeText = template.largeTextTemplate ? this.renderString(template.largeTextTemplate, vars) : undefined;
    const smallText = template.smallTextTemplate ? this.renderString(template.smallTextTemplate, vars) : undefined;

    return {
      details: details || "Active",
      ...(state ? { state } : {}),
      ...(largeText ? { largeText } : {}),
      ...(smallText ? { smallText } : {}),
    };
  }

  private resolveToken(token: string, vars: TemplateVariables): string | undefined {
    const parts = token.split(".");
    let current: unknown = vars;

    for (const part of parts) {
      if (current == null || typeof current !== "object") {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    if (current == null || typeof current === "object") {
      return undefined;
    }

    return String(current);
  }
}
