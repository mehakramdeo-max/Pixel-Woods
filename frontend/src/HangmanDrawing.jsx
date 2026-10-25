import { MAX_MISTAKES } from './gameData.js'

export function HangmanDrawing({ mistakes }) {
  return (
    <svg
      className="hangman-drawing"
      viewBox="0 0 220 190"
      role="img"
      aria-label={`Hangman drawing, ${mistakes} of ${MAX_MISTAKES} incorrect guesses`}
    >
      <g className="gallows">
        <path d="M22 174H158M54 174V18H132V39" />
        <path d="M54 39H132" />
      </g>
      {mistakes > 0 && <circle className="hangman-part" cx="132" cy="58" r="19" />}
      {mistakes > 1 && <path className="hangman-part" d="M132 77V125" />}
      {mistakes > 2 && <path className="hangman-part" d="M132 89L104 111" />}
      {mistakes > 3 && <path className="hangman-part" d="M132 89L160 111" />}
      {mistakes > 4 && <path className="hangman-part" d="M132 125L108 155" />}
      {mistakes > 5 && <path className="hangman-part" d="M132 125L156 155" />}
      {mistakes > 0 && (
        <g className="hangman-face">
          <path d="M124 54h3m13 0h3M126 67h12" />
        </g>
      )}
    </svg>
  )
}
