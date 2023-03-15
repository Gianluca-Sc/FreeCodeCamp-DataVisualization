const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = { top: 20, right: 20, bottom: 20, left: 70 };
const width = 800;
const height = 400;

const formatDate = d3.timeFormat("%M:%S");

const parseRow = (data) => {
  data.forEach((d) => {
    d.Year = new Date(d.Year, 0, 1);
    const tempTime = d.Time.split(":");
    d.Time = new Date(1970, 0, 1, 0, tempTime[0], tempTime[1]);
  });
};

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

const color = d3.scaleOrdinal(d3.schemeCategory10);

const main = async () => {
  try {
    const data = await d3.json(URL);
    parseRow(data);

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => {
          let year = new Date(d.Year);
          return year.setFullYear(d.Year.getFullYear() - 1);
        }),
        d3.max(data, (d) => {
          let year = new Date(d.Year);
          return year.setFullYear(d.Year.getFullYear() + 1);
        }),
      ])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Time))
      .range([margin.bottom, height - margin.top]);

    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.Time))
      .attr("r", 6)
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.Time)
      .attr("fill", (d) => color(d.Doping != ""))
      .attr("stroke", "black")
      .classed("dot", true)
      .on("mouseover", (e, d) => {
        tooltip
          .html(
            `<p>${d.Name}: ${d.Nationality}</p>  
            <p>Year: ${d.Year.getFullYear()}, Time: ${formatDate(d.Time)}</p>
            ${d.Doping ? "<p>" + d.Doping + "</p>" : ""}
            `
          )
          .transition()
          .style("left", e.clientX + 15 + "px")
          .style("top", e.clientY + "px")
          .style("opacity", 1)
          .attr("data-year", () => {
            return e.target.getAttribute("data-xvalue");
          });
      })
      .on("mouseout", (e, d) => {
        tooltip.transition().style("opacity", 0);
      });

    // X-Axis
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Y-Axis
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(formatDate));

    svg
      .append("text")
      .attr("x", -250)
      .attr("y", margin.left - 55 + "px")
      .attr("transform", "rotate(-90)")
      .text("Time in Minutes");

    // Legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(20,100)");

    legend
      .selectAll("text")
      .data(color.domain())
      .join("text")
      .attr("x", width - 165)
      .attr("y", (d, i) => i * 20 + 10)
      .text((d) =>
        d ? "Riders with doping allegations" : "No doping allegations"
      );

    legend
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
      .attr("x", width - 180)
      .attr("y", (d, i) => i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color);
  } catch (error) {
    console.log(error);
  }
};

main();
