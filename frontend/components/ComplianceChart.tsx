"use client"

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ComplianceChart({ regulations }: any) {

  const compliant = regulations.filter((r: any) => r.status === "Compliant").length;
  const pending = regulations.filter((r: any) => r.status === "Pending").length;
  const non = regulations.filter((r: any) => r.status === "Non-Compliant").length;

  const data = [
    { name: "Compliant", value: compliant },
    { name: "Pending", value: pending },
    { name: "Non-Compliant", value: non }
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (

    <div className="border rounded-xl p-6 bg-white shadow-sm">

      <h3 className="font-semibold mb-4">
        Compliance Progress
      </h3>

      <PieChart width={320} height={220}>

        <Pie data={data} dataKey="value" outerRadius={80}>

          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}

        </Pie>

        <Tooltip />

      </PieChart>

    </div>
  );
}