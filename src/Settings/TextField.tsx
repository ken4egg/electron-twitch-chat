import styled from 'styled-components';
import * as React from 'react';

interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextField = React.memo<InputProps>(({ onChange, value }) => {
  return <Input type="text" onChange={onChange} value={value} />;
});

TextField.displayName = 'TextField';

const Input = styled.input`
  width: 100%;
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  height: 100%;
  color: white;
  margin: 20px;
`;
