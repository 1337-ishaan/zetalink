import domPurify from 'isomorphic-dompurify';

export const sanitizeInput = (inputText: string): string => {
  return domPurify.sanitize(inputText);
};
