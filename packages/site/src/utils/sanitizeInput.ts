import DOMPurify from 'dompurify';

export const sanitizeInput = (inputText: string): string => {
  return DOMPurify.sanitize(inputText);
};
