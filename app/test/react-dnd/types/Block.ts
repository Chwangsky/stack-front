export type Block = {
  id: string;
  content: string;
  children?: Block[];
};