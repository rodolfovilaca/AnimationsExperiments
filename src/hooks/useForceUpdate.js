import {useState} from 'react'

export default function useForceUpdate() {
  const [value, set] = useState(true);
  return () => set(value => !value);
}