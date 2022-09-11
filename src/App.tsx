import "./styles.css";
import { namen } from "./names";
import berufeJSON from "../public/berufe.json";
import { shuffle } from "lodash";
import Fuse from "fuse.js";
import { Component, useEffect, useState } from "react";
import { nanoid } from "nanoid";
const berufe: { [key: string]: string } = berufeJSON;

const berufearr: { m: string; w: string }[] = [];
for (const m in berufe) {
  if (Object.prototype.hasOwnProperty.call(berufe, m)) {
    const w = berufe[m];
    berufearr.push({ m, w });
  }
}
const search = new Fuse(berufearr, {
  ignoreLocation: true,
  isCaseSensitive: false,
  includeScore: true,
  keys: ["m", "w"]
});

function sameBeginningChars<T>(
  s: T,
  arr: T[],
  xChars = 1,
  iratee?: (e: T) => string
) {
  function handle(e: T): string {
    if (typeof e == "string") {
      return e;
    } else if (iratee != undefined) {
      return iratee(e);
    }
  }
  const handled = handle(s).substring(0, xChars);
  console.log(handled);

  return arr.filter((el) => {
    return handled == handle(el).substring(0, xChars);
  });
}

function getSimilar(r: string, score = 0.1) {
  return search.search(r).filter((e) => e.score !== 1 && e.score < score);
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type options = { sameXChars: number };
class Figur extends Component<
  {
    namenDb: typeof namen;
    berufeDb: typeof berufearr;
  },
  { similarFiguren: Figur[] }
> {
  selection: {
    namenDb: typeof namen;
    berufeDb: typeof berufearr;
  };
  key = nanoid();
  state = { similarFiguren: [] };
  name: ArrayElement<typeof namen>;
  beruf: ArrayElement<typeof berufearr>;
  constructor(props) {
    super(props);
    const { namenDb, berufeDb } = props;
    this.selection = { namenDb, berufeDb };
    this.name = shuffle(namenDb)[0];
    this.beruf = shuffle(berufeDb)[0];
  }

  figur() {
    function display(str: string) {
      if (str) return str;
      return "No Data";
    }
    return (
      <div>
        <span>{`${display(this.name.name)} ; ${display(this.beruf.m)}`} </span>
      </div>
    );
  }
  render() {
    return (
      <>
        <button
          onClick={() => {
            this.setState({
              similarFiguren: this.getSimilarFigur(2, { sameXChars: 3 })
            });
          }}
        >
          Figuren
        </button>
        {this.figur()}
        <div style={{ backgroundSize: "12rem", backgroundColor: "gray" }}>
          {this.state.similarFiguren.map((e) => e.figur())}
        </div>
      </>
    );
  }
  getSimilarFigur(anzahl: number, namenOpt: options) {
    const figuren: Figur[] = [];
    let berufeDb = berufearr;
    let namenDb = this.selection.namenDb;
    function filterByFig(fig: Figur) {
      berufeDb = berufeDb.filter((e) => e != fig?.beruf);
      namenDb = sameBeginningChars(this.name, namenDb, 4, (e) => e.name);
      console.log(namenDb);
    }
    filterByFig(this);
    for (let i = 0; i < anzahl; i++) {
      const fig = new Figur({
        berufeDb,
        namenDb
      });
      filterByFig(fig);
      figuren.push(fig);
    }
    return figuren;
  }
}

export default function App() {
  function gen() {
    return <Figur namenDb={namen} berufeDb={berufearr} />;
  }
  const [figur, setFigur] = useState(gen());

  return (
    <div className="App">
      <button onClick={() => setFigur((e) => gen())}>Random</button>
      <div key={nanoid()}>{figur}</div>
    </div>
  );
}
