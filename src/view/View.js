export class View {
  async loadTemplate(path) {
    const response = await fetch(path);
    return response.text();
  }

  replaceTemplate(template, data) {
    const withConditionals = template.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, key, content) => {
      return data[key] ? content : '';
    });

    return withConditionals.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
  }
}
