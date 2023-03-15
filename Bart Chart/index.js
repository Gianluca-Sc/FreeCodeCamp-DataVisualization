const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const margin = { top: 20, right: 20, bottom: 20, left: 50 };
const width = 800;
const height = 400;

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatDate = d3.timeFormat("%Y-%m-%d");
const formatDateQuarter = (date) => {
  const tempDate = d3.timeFormat("%Y-%m")(date).split("-");
  let quarter;
  switch (tempDate[1]) {
    case "01":
      quarter = "Q1";
      break;
    case "04":
      quarter = "Q2";
      break;
    case "07":
      quarter = "Q3";
      break;
    case "10":
      quarter = "Q4";
      break;
    default:
      break;
  }
  return `${tempDate[0]} ${quarter}`;
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

const main = async () => {
  try {
    const data = await d3.json(URL);
    const dataset = data.data.map((element) => {
      return { date: new Date(element[0]), value: +element[1] };
    });

    const barWidth = (width - margin.left - margin.right) / dataset.length;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataset, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.value)])
      .range([height - margin.bottom, margin.top]);

    svg
      .append("text")
      .attr("x", -250)
      .attr("y", margin.right + 60 + "px")
      .attr("transform", "rotate(-90)")
      .text("Gross Domestic Product");

    svg
      .selectAll("rect")
      .data(dataset)
      .join("rect")
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(d.value))
      .attr("width", barWidth)
      .attr("height", (d) => height - margin.bottom - yScale(d.value))
      .attr("data-date", (d) => formatDate(d.date))
      .attr("data-gdp", (d) => d.value)
      .classed("bar", true)
      .on("mouseover", (e, d) => {
        tooltip
          .style("left", `${e.clientX + 20}px`)
          .style("top", `${e.clientY}px`)
          .style("opacity", 1)

          .attr("data-date", formatDate(d.date))
          .html(
            `<p id="tooltip-date">${formatDateQuarter(d.date)}</p>
            <p id="tooltip-value">${USDollar.format(d.value)} Billion</p>`
          )
          .transition();
      })
      .on("mouseout", () => {
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
      .call(d3.axisLeft(yScale));
  } catch (error) {
    console.log(error);
  }
};

main();
