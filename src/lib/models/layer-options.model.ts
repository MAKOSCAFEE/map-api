interface OptionsEvent {
  onClick?: () => void;
  onRightClick?: () => any;
}

export interface LayerOptions extends OptionsEvent {
  id?: string;
  index?: number;
  type?: string;
  data?: any;
  label?: boolean;
  url?: string;
  attribution?: string;
  labelStyle?: any;
}
