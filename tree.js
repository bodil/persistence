import "./tree.less";
import * as d3 from "d3";
console.log(d3);

const presets = {
  conslist: {
    id: "cons1",
    _children: [
      {
        name: "val = 1",
        parent: "cons1"
      },
      {
        id: "cons2",
        parent: "cons1",
        _children: [
          { name: "val = 2", parent: "cons2" },
          {
            id: "cons3",
            parent: "cons2",
            _children: [
              { name: "val = 3", parent: "cons3" },
              { name: "end", parent: "cons3" }
            ]
          }
        ]
      }
    ]
  },

  binarytree: {
    name: "8",
    children: [
      {
        name: "4",
        parent: "8",
        children: [
          {
            name: "2",
            parent: "4",
            children: [{ name: "1", parent: "2" }, { name: "3", parent: "2" }]
          },
          {
            name: "6",
            parent: "4",
            children: [{ name: "5", parent: "6" }, { name: "7", parent: "6" }]
          }
        ]
      },
      {
        name: "12",
        parent: "8",
        children: [
          {
            name: "10",
            parent: "12",
            children: [
              { name: "9", parent: "10" },
              { name: "11", parent: "10" }
            ]
          },
          {
            name: "14",
            parent: "12",
            children: [
              { name: "13", parent: "14" },
              { name: "15", parent: "14" }
            ]
          }
        ]
      }
    ]
  }
};

const duration = 750;

export default class Graph {
  constructor(slide) {
    this.slide = slide;
    this.slide.classList.add("graph");
    this.target = slide.querySelector(".slideContainer");
    this.target.style.width = "100%";
    this.target.style.height = "100%";
    this.data = JSON.parse(this.target.innerHTML);
    if (typeof this.data === "string") {
      this.data = presets[this.data];
    }
    this.target.innerHTML = "";
    this.idCounter = 0;
  }

  activate() {
    const h = this.target.clientHeight;
    const w = this.target.clientWidth;
    this.tree = d3.layout.tree().size([w, h]);
    this.diagonal = d3.svg.diagonal().projection(d => [d.x, d.y / 2]);
    this.svg = d3
      .select(this.target)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .append("g")
      .attr("transform", "translate(0, 20)");

    this.data.x0 = w / 2;
    this.data.y0 = 0;

    this.update(this.data);
  }

  stabilise() {}

  cleanup() {
    this.target.innerHTML = "";
  }

  update(source) {
    const nodes = this.tree.nodes(this.data).reverse();

    const links = this.tree.links(nodes);
    nodes.forEach(d => {
      d.y = d.depth * 180;
    });

    const node = this.svg
      .selectAll("g.node")
      .data(nodes, d => d.id || (d.id = ++this.idCounter));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        d => "translate(" + source.x0 + "," + source.y0 / 2 + ")"
      )
      .on("click", this.click.bind(this));

    nodeEnter
      .append("circle")
      .attr("r", 1e-6)
      .style("fill", d => (d._children ? "lightsteelblue" : "#fff"));

    nodeEnter
      .append("text")
      .attr("y", 30)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node
      .transition()
      .duration(duration)
      .attr("transform", d => "translate(" + d.x + "," + d.y / 2 + ")");

    nodeUpdate
      .select("circle")
      .attr("r", 10)
      .style("fill", d => (d._children ? "lightsteelblue" : "#fff"));

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr(
        "transform",
        d => "translate(" + source.x + "," + source.y / 2 + ")"
      )
      .remove();

    nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Update the links…
    var link = this.svg.selectAll("path.link").data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", d => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal({ source: o, target: o });
      });

    // Transition links to their new position.
    link
      .transition()
      .duration(duration)
      .attr("d", this.diagonal);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", d => {
        const o = { x: source.x, y: source.y };
        return this.diagonal({ source: o, target: o });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }
}
