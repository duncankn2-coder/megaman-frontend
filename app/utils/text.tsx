import React from 'react';

export const renderWithSup = (text: string | null | undefined): React.ReactNode => {
  if (!text) return null;
  const parts = text.split(/(®|™)/g);
  return parts.map((part, index) => {
    if (part === '®') {
      return <sup key={index}>®</sup>;
    }
    if (part === '™') {
      return <sup key={index}>™</sup>;
    }
    return part;
  });
};
