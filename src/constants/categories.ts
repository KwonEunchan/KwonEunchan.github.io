export const CATEGORIES = [
    "전체",
    "Infra/SRE", 
    "Middleware",
    "Java",   
    "Database"
  ] as const;
  
  export type Category = typeof CATEGORIES[number];