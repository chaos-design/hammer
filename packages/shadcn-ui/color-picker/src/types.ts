export interface ColorPickerClassNames {
  sbContainer?: string;
  slidersContainer?: string;
  hueSlider?: string;
  opacitySlider?: string;
  preview?: string;
  inputsContainer?: string;
  formatSelect?: string;
  hexInput?: string;
  rgbInput?: string;
  hsbInput?: string;
  opacityInput?: string;
}

export interface ColorPickerProps {
  /** Current colour as a hex string, e.g. `'#3b82f6'`. */
  color: string;
  /** Called with the new hex string on every change. */
  onChange: (color: string) => void;
  className?: string;
  classNames?: ColorPickerClassNames;
}
