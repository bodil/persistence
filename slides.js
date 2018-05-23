import Pink from "pink";
import background from "pink/modules/background";
import image from "pink/modules/image";
import highlight from "pink/modules/highlight";
import tree from "./tree";
import repl from "pink-repl";
import rust from "./client/rust";
import "./screen.less";
import "pink/css/themes/league.less";
import "highlight.js/styles/github.css";

new Pink("#slides", {
  background,
  image,
  highlight,
  tree,
  repl: repl({ rust })
});
