import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { PerformanceTrend } from "@/hooks/useStudentResults";

interface PerformanceTrendChartProps {
  data: PerformanceTrend[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Performance Trend</h2>
            <p className="text-sm text-muted-foreground">
              SGPA and CGPA progression across semesters
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="semester"
                tickFormatter={(value) => `Sem ${value}`}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(value) => `Semester ${value}`}
                formatter={(value: number, name: string) => [
                  value.toFixed(2),
                  name === "sgpa" ? "SGPA" : "CGPA",
                ]}
              />
              <Legend
                formatter={(value) => (value === "sgpa" ? "SGPA" : "CGPA")}
              />
              <Line
                type="monotone"
                dataKey="sgpa"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cgpa"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Summary */}
        <div className="mt-4 flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">SGPA (Semester Grade Point Average)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">CGPA (Cumulative Grade Point Average)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
