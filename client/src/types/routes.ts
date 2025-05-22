import { OpenModalProps } from "../hooks/hook";

export interface RouteType {
  path: string;
  component: React.ComponentType<OpenModalProps>;
  layout: 'user' | 'admin';
}
