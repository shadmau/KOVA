import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const InvestmentConstraint = ({ onChange }) => {
  const [amount, setAmount] = useState("100");
  const [unit, setUnit] = useState("USDT");
  const [frequency, setFrequency] = useState("per trade");

  useEffect(() => {
    onChange?.({
      amount,
      unit,
      frequency,
      constraint: `Maximum investment limit is ${amount} ${unit} ${frequency}`,
      maxInvestment: amount,
    });
  }, [amount, unit, frequency, onChange]);

  return (
    <Card className="bg-white/5 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-500">
            Investment Constraints
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-500">Constraint Type</Label>
            <Select value="Maximum investment limit" onValueChange={() => {}}>
              <SelectTrigger className="focus:border-purple-400 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maximum investment limit">
                  Maximum investment limit
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-500">Amount</Label>
              <Select value={amount} onValueChange={setAmount}>
                <SelectTrigger className="focus:border-purple-400 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-500">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger
                  disabled
                  className="focus:border-purple-400 border-gray-300"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-500">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="focus:border-purple-400 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per trade">per trade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 border border-purple-400 bg-purple-300/20 rounded-lg">
            <Label className="text-gray-500">Constraint Preview</Label>
            <p className="mt-2 text-purple-500">
              Maximum investment limit is {amount} {unit} {frequency}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentConstraint;
