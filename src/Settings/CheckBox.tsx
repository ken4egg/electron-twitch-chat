import * as React from 'react';
import styled from 'styled-components';

interface CheckBoxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckBox = React.memo<React.PropsWithChildren<CheckBoxProps>>(
  ({ onChange, checked, children }) => {
    const ref = React.useRef<HTMLInputElement>(null);

    const onClick = React.useCallback(() => {
      ref.current?.click();
      ref.current?.focus();
    }, []);

    return (
      <CheckBoxStyled>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={onChange}
        />

        <Label onClick={onClick}>{children}</Label>
      </CheckBoxStyled>
    );
  }
);

CheckBox.displayName = 'CheckBox';

const Label = styled.label`
  font-size: 16px;
`;

const CheckBoxStyled = styled.div`
  width: 100%;
  display: flex;
  padding: 5px 25px;

  & > input {
    opacity: 0;
    position: absolute;
  }

  & > input + label {
    user-select: none;
    pointer-events: none;
  }

  & > input + label::before,
  input + label::after {
    content: '';
    position: absolute;
    transition: 150ms cubic-bezier(0.24, 0, 0.5, 1);
    transform: translateY(-50%);
    top: 50%;
    right: 10px;
    cursor: pointer;
    pointer-events: all;
  }

  & > input + label::before {
    height: 30px;
    width: 50px;
    border-radius: 30px;
    background: rgba(214, 214, 214, 0.434);
  }

  & > input + label::after {
    height: 24px;
    width: 24px;
    border-radius: 60px;
    right: 32px;
    background: #fff;
  }

  & > input:checked + label:before {
    background: #5d68e2;
    transition: all 150ms cubic-bezier(0, 0, 0, 0.1);
  }

  & > input:checked + label:after {
    right: 14px;
  }

  & > input:focus + label:before {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.75);
  }
`;
