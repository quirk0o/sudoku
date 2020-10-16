import React from "react";
import "./styles.css";
import classNames from "classnames";
import { symmetricDifference, equals, pipe, map, over, lensPath, applyTo, compose } from "ramda";

const useOnClickOutside = (ref, handler) => {
  React.useEffect(
    () => {
      const listener = event => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    [ref, handler]
  );
}

const useKeyPress = (keydownListener, keyupListener) => {
  React.useEffect(() => {
    window.addEventListener("keydown", keydownListener, true);
    return () => window.removeEventListener("keydown", keydownListener, true);
  }, [keydownListener]);

  React.useEffect(() => {
    window.addEventListener("keyup", keyupListener, true);
    return () => window.removeEventListener("keyup", keyupListener, true);
  }, [keyupListener]);
};

const useOnKeyPress = (handler, {allowedKeys} = {}) => {
  const [key, setKey] = React.useState(null)

  const onKeydown = React.useCallback(
    (e) => allowedKeys ? allowedKeys.includes(e.key) && setKey(e.key) : setKey(e.key),
    [allowedKeys]
  );
  const onKeyup = React.useCallback(
    (e) => e.key === key && handler(key),
    [key, handler]
  );

  useKeyPress(onKeydown, onKeyup)
}

const useKeyState = (...codes) => {
  const memoCodes = React.useRef(codes);
  const [pressed, setPressed] = React.useState(false);
  const onKeydown = React.useCallback(
    (e) => memoCodes.current.includes(e.key) && setPressed(true),
    []
  );
  const onKeyup = React.useCallback(
    (e) => memoCodes.current.includes(e.key) && setPressed(false),
    []
  );
  useKeyPress(onKeydown, onKeyup);

  return pressed;
};

const Modes = Object.freeze({
  Normal: 'NORMAL',
  Corner: 'CORNER',
  Center: 'CENTER',
  Color: 'COLOR'
})

export default function App({ width, height, background }) {
  const [mode, setMode] = React.useState(Modes.Normal)
  const gridRef = React.useRef()
  const grid = Array(height)
    .fill(null)
    .map((row) => Array(width).fill(null));
  const bg = background;
  const cellSize = 64;

  const [values, setValues] = React.useState(grid)
  const [selected, setSelected] = React.useState([]);
  const [selecting, setSelecting] = React.useState(false)
  const metaPressed = useKeyState("Meta");

  const onSelectionEnd = () => {
    setSelecting(false)
  };

  const select = ([x, y]) => {
    if (metaPressed) {
      setSelected(selected => symmetricDifference(selected, [y * width + x]));
    } else {
      setSelected(selected => selected.concat([y * width + x]));
    }
  }

  const arrowSelect = ([x, y]) => {
    if (metaPressed) {
      setSelected(selected => symmetricDifference(selected, y * width + x));
    } else {
      setSelected([y * width + x]);
    }
  }

  const clearSelection = () => {
    setSelected([])
  }

  const onSelectionStart = (coords) => {
    setSelecting(true)
    if (!metaPressed) clearSelection()
    select(coords)
  }

  const onDrag = (coords) => {
    if (selecting) select(coords)
  }

  useOnClickOutside(gridRef, clearSelection)

  const onDigitPress = React.useCallback((key) => {
    const setters = pipe(
      map(cell => {
        const x = cell % width
      const y = Math.floor(cell / width) 
      return [x, y]
      }),
      map(([x, y]) => values => {
        console.log(values)
        const newRow = [...values[y]]
        newRow[x] = newRow[x] === key ? null : key
        values[y] = newRow
        return values
      })
    )(selected)

    setValues(values => compose(...setters).call(null, [...values]))
    
  }, [selected, width])
  useOnKeyPress(onDigitPress, {allowedKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']})

  const onDeletePress = React.useCallback(() => {
const setters = pipe(
      map(cell => {
        const x = cell % width
      const y = Math.floor(cell / width) 
      return [x, y]
      }),
      map(([x, y]) => values => {
        const newRow = [...values[y]]
        newRow[x] = null
        values[y] = newRow
        return values
      })
    )(selected)

    setValues(values => compose(...setters).call(null, [...values]))
  }, [selected, width])

  useOnKeyPress(onDeletePress, {allowedKeys: ['Backspace', 'Delete']})

  const onArrowPress = React.useCallback((key) => {
    const current = selected[0]
    if (!current) arrowSelect([0, 0])

    const [x, y] = [current % width, Math.floor(current / width)]
    console.log(current)
    switch (key) {
      case 'ArrowUp':
        return arrowSelect([x, y > 0 ? y - 1 : height - 1])
              case 'ArrowDown':
        return arrowSelect([x, (y + 1) % height])
              case 'ArrowLeft':
        return arrowSelect([x > 0 ? x - 1 : width - 1, y])
              case 'ArrowRight':
        return arrowSelect([(x + 1) % width, y])
      default:
        return
    }
  }, [selected, arrowSelect, height, width])

    useOnKeyPress(onArrowPress, {allowedKeys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']})


  return (
    <div>
      <section
        ref={gridRef}
        className="grid"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "contain",
          width: `${width * cellSize}px`,
          height: `${height * cellSize}px`,
          display: "grid",
          gridTemplateColumns: `repeat(${width}, 1fr)`
        }}
      >
        {values.flatMap((row, y) => (
          <div className="row">
            {row.map((val, x) => (
              <div
                key={`${x}-${y}`}
                className={classNames("cell", {
                  selected: selected.includes(y * width + x)
                })}
                onMouseDown={(e) => onSelectionStart([x, y])}
                onMouseOver={(e) => onDrag([x, y])}
                onMouseUp={(e) => onSelectionEnd()}
              >
                <div className="normal">{val}</div>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section></section>
    </div>
  );
}
