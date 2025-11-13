const interpolationRegex = /{{\s*(.+?)\s*}}/g;

export const interpolate = (template: string, variables: Record<string, unknown>): string => {
  if (!template || typeof template !== "string") {
    return template;
  }

  return template.replace(interpolationRegex, (_, token: string) => {
    if (!Object.prototype.hasOwnProperty.call(variables, token)) {
      return `{{${token}}}`;
    }

    const value = variables[token];
    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  });
};
