import _sanitizeHtml from 'sanitize-html';

export default function sanitizeHtml(dirty: string) {
  return _sanitizeHtml(dirty, {
    allowedAttributes: {
      ..._sanitizeHtml.defaults.allowedAttributes,
      '*': ['style'],
    },
  });
}
