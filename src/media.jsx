import { css } from 'styled-components'

const sizes = {
   web: 1000,
   mobile: 0
}

export default Object.keys(sizes).reduce((acc, label) => {
   acc[label] = (...args) => css`
      @media (min-width: ${sizes[label]}px) {
         ${css(...args)};
      }
   `
   return acc
}, {})