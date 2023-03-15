const URL = {
  title: "Video Game Sales:",
  url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
};

const margin = { top: 20, right: 20, bottom: 80, left: 20 };
const width = 900;
const height = 600;

const tooltip = d3
  .select(".container")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const main = async () => {
  try {
    const data = await d3.json(URL.url);
    const root = d3.hierarchy(data);

    const treemap = d3
      .treemap()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])
      .paddingInner(1);

    treemap(
      root
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value)
    ).descendants();

    const colorScale = d3
      .scaleOrdinal()
      .range([...d3.schemeCategory10, ...d3.schemeAccent]);

    const rect = svg
      .selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.data.category))
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .classed("tile", true)
      .on("mousemove", (e, d) => {
        tooltip
          .html(
            `
            <p>Name: ${d.data.name}</p> 
            <p>Category: ${d.data.category}</p> 
            <p>Value: ${d.data.value}</p>
            `
          )
          .style("left", e.clientX + 15 + "px")
          .style("top", e.clientY + "px")
          .style("opacity", 1)
          .attr("data-value", d.data.value);
      })
      .on("mouseout", (e, d) => {
        tooltip.style("opacity", 0);
      });

    svg
      .selectAll("text")
      .data(root.leaves())
      .join("text")
      .selectAll("tspan")
      .data((d) => {
        return d.data.name.split(/(?=[A-Z][^A-Z])/g).map((v) => {
          return {
            text: v,
            x0: d.x0,
            y0: d.y0,
          };
        });
      })
      .join("tspan")
      .attr("x", (d) => d.x0 + 2)
      .attr("y", (d, i) => d.y0 + 10 + i * 10)
      .attr("fill", "white")
      .text((d) => d.text);

    // Legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width / 6},${height - margin.bottom})`);

    legend
      .selectAll("rect")
      .data(colorScale.domain())
      .join("rect")
      .attr("x", (d, i) => i * 32)
      .attr("y", 0)
      .attr("width", 25)
      .attr("height", 20)
      .attr("fill", (d, i) => colorScale(d))
      .classed("legend-item", true);

    legend
      .selectAll("text")
      .data(colorScale.domain())
      .join("text")
      .attr("x", (d, i) => i * 32 + 4)
      .attr("y", 25)
      .text((d, i) => d)
      .style("alignment-baseline", " central")
      .style("text-anchor", " start");
  } catch (error) {
    console.log(error);
  }
};

main();
