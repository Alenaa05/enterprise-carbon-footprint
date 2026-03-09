import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../services/dynamo";
import { v4 as uuid } from "uuid";

const TABLE = process.env.REPORTS_TABLE!;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

/* GET REPORTS */

export const getReports = async () => {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    }),
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items || []),
  };
};

/* GENERATE REPORT */

export const generateReport = async (event: any) => {
  const body = JSON.parse(event.body);

  const id = uuid();

  const item = {
    id,
    title: body.title,
    generated: new Date().toISOString(),
    emissions: body.emissions,
    renewableEnergy: body.renewableEnergy,
    waterUsage: body.waterUsage,
    wasteRecycled: body.wasteRecycled,
    downloads: 0,
  };

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    }),
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(item),
  };
};

/* EXPORT ALL REPORTS */

export const exportReports = async () => {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    }),
  );

  const reports = result.Items || [];

  let html = `
  <html>
  <head>
  <title>Sustainability Reports</title>

  <style>
  body{
    font-family:Arial;
    padding:40px;
  }

  h1{
    color:#047857;
  }

  .report{
    border:1px solid #ddd;
    padding:20px;
    margin-bottom:20px;
    border-radius:8px;
  }

  </style>
  </head>

  <body>

  <h1>Sustainability Reports</h1>
  `;

  reports.forEach((r: any) => {
    html += `
    <div class="report">
      <h2>${r.title}</h2>
      <p><b>Generated:</b> ${new Date(r.generated).toLocaleDateString()}</p>
      <p><b>Emissions:</b> ${r.emissions}</p>
      <p><b>Renewable Energy:</b> ${r.renewableEnergy}%</p>
      <p><b>Water Usage:</b> ${r.waterUsage}</p>
      <p><b>Waste Recycled:</b> ${r.wasteRecycled}%</p>
    </div>
    `;
  });

  html += `
  </body>
  </html>
  `;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": "attachment; filename=reports.html",
      "Access-Control-Allow-Origin": "*",
    },
    body: html,
  };
};

/* DOWNLOAD SINGLE REPORT */

export const downloadReport = async (event: any) => {
  const id = event.pathParameters.id;

  const result = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: { id },
    }),
  );

  const report: any = result.Item;

  if (!report) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Report not found" }),
    };
  }

  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: "SET downloads = downloads + :inc",
      ExpressionAttributeValues: {
        ":inc": 1,
      },
    }),
  );

  const html = `
  <html>

  <head>
  <title>${report.title}</title>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <style>

  body{
    font-family:Arial;
    padding:40px;
  }

  h1{
    color:#047857;
  }

  .grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:20px;
  }

  .card{
    border:1px solid #ddd;
    padding:20px;
    border-radius:8px;
  }

  </style>

  </head>

  <body>

  <h1>${report.title}</h1>

  <p>Generated: ${new Date(report.generated).toLocaleDateString()}</p>

  <div class="grid">

  <div class="card">
  <h3>Emissions</h3>
  <h2>${report.emissions}</h2>
  </div>

  <div class="card">
  <h3>Renewable Energy</h3>
  <h2>${report.renewableEnergy}%</h2>
  </div>

  <div class="card">
  <h3>Water Usage</h3>
  <h2>${report.waterUsage}</h2>
  </div>

  <div class="card">
  <h3>Waste Recycled</h3>
  <h2>${report.wasteRecycled}%</h2>
  </div>

  </div>

  <h2>Carbon Distribution</h2>

  <canvas id="chart"></canvas>

  <script>

  new Chart(document.getElementById('chart'),{
    type:'pie',
    data:{
      labels:['Energy','Transport','Supply Chain','Waste'],
      datasets:[{
        data:[245000,128000,892000,45000],
        backgroundColor:['#10b981','#059669','#047857','#065f46']
      }]
    }
  })

  </script>

  </body>
  </html>
  `;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename=${report.title}.html`,
      "Access-Control-Allow-Origin": "*",
    },
    body: html,
  };
};
