interface OptionsEvent {
  onClick?: () => void;
  onRightClick?: () => any;
}

export interface LayerOptions extends OptionsEvent {
  id?: string;
  index?: number;
  type?: string;
}
