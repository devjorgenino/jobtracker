/**
 * Elimina formato markdown de un texto para mostrar solo texto plano en el PDF.
 */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let s = text.trim();
  // Negrita **texto** o __texto__ primero (antes de eliminar *)
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/__([^_]+)__/g, '$1');
  // Enlaces: [texto](url) -> texto
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // Cursiva *texto* (solo un asterisco)
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/_([^_]+)_/g, '$1');
  // Código `texto`
  s = s.replace(/`([^`]+)`/g, '$1');
  // Encabezados al inicio de línea: # ## ###
  s = s.replace(/^#+\s*/gm, '');
  // Líneas de bloque --- o ***
  s = s.replace(/^[-*_]{2,}\s*$/gm, '');
  // Espacios múltiples -> uno solo
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}
