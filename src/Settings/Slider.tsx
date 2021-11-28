import * as React from 'react';
import styled from 'styled-components';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Slider = React.memo<SliderProps>(
  ({ onChange, value, min, max }) => {
    const inputStyle = React.useMemo(
      () => ({
        background: `linear-gradient(90deg, rgb(11, 30, 223) ${value}%, rgba(255, 255, 255, 0.216) ${
          value + 0.1
        }%)`,
      }),
      [value]
    );

    return (
      <SliderStyled
        type="range"
        style={inputStyle}
        onChange={onChange}
        min={min}
        max={max}
        value={value}
      />
    );
  }
);

Slider.displayName = 'Slider';

const SliderStyled = styled.input`
  -webkit-appearance: none;
  width: calc(100% - (70px));
  height: 2px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.314);
  outline: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  vertical-align: middle;

  ::before,
  ::after {
    position: absolute;
    vertical-align: middle;
    position: absolute;
    color: #fff;
    font-size: 0.9rem;
    top: 50%;
    transform: translate(0, -50%);
  }

  ::before {
    content: attr(min);
    left: 20px;
  }

  ::after {
    content: attr(max);
    right: 7px;
  }

  ::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  ::-webkit-slider-thumb:hover {
    background: #d4d4d4;
    transform: scale(1.2);
  }
`;
