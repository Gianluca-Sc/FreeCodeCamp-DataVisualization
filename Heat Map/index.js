const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const margin = { top: 20, right: 50, bottom: 70, left: 70 };
const width = 900;
const height = 500;

const formatDate = d3.timeFormat("%M:%S");

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
    const data = await d3.json(URL);
    const { monthlyVariance, baseTemperature } = data;

    const years = monthlyVariance.map((e) => e.year);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const xScale = d3
      .scaleBand()
      .domain(years)
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(d3.range(12))
      .range([margin.top, height - margin.bottom]);

    const extent = d3.extent(
      monthlyVariance,
      (d) => baseTemperature + d.variance
    );

    const colorScale = d3
      .scaleQuantize()
      .domain([extent[0], extent[1]])
      .range(d3.schemeRdYlBu["11"].reverse());

    const colorRange = [];
    for (var i = 0; i < colorScale.range().length; i++) {
      colorRange.push(
        d3.format(".1f")(colorScale.invertExtent(colorScale.range()[i])[0])
      );
    }

    svg
      .selectAll("rect")
      .data(monthlyVariance)
      .join("rect")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", (d) => xScale.bandwidth(d.year))
      .attr("height", (d) => yScale.bandwidth(d.month - 1))
      .attr("data-year", (d) => d.year)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-temp", (d) => d.variance)
      .attr("fill", (d) => colorScale(baseTemperature + d.variance))
      .classed("cell", true)
      .on("mouseover", (e, d) => {
        tooltip
          .html(
            `<p>${d.year} - ${months[d.month - 1]}</p> 
            <p>${d3.format(".1f")(baseTemperature + d.variance)}°C </p> 
            <p>${d3.format("+.1f")(d.variance)}°C </p>
            `
          )
          .style("left", e.clientX + 15 + "px")
          .style("top", e.clientY + "px")
          .style("opacity", 1)
          .attr("data-year", d.year);
      })
      .on("mouseout", (e, d) => {
        tooltip.style("opacity", 0);
      });

    // X-Axis
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xScale.domain().filter((d) => d % 10 === 0))
      );

    // Y-Axis
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => months[d]));

    svg
      .append("text")
      .attr("x", -250)
      .attr("y", margin.left - 60 + "px")
      .attr("transform", "rotate(-90)")
      .text("Months");

    // Legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `rotate(90)`)
      .attr("transform", `translate(${width - 40},${height / 4})`);

    legend
      .selectAll("rect")
      .data(colorScale.range())
      .join("rect")
      .attr("x", 20)
      .attr("y", (d, i) => i * 21)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d, i) => d);

    legend
      .selectAll("text")
      .data(d3.range(11))
      .join("text")
      .attr("x", 15)
      .attr("y", (d, i) => i * 21 + 20)
      .text((d, i) => colorRange[i + 1])
      .style("alignment-baseline", " central")
      .style("text-anchor", " end");
  } catch (error) {
    console.log(error);
  }
};

main();
