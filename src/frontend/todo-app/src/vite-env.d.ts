/// <reference types="vite/client" />

// Allow importing CSS files
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow importing images
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
