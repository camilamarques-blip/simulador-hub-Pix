import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";

export default function PixSimulator() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState(null);

  const calculateParcelado = (value) => {
    const parcelas = 12;
    const taxaAnual = 0.0499;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const valorParcela = (value * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -parcelas));
    return {
      parcelas,
      valorParcela: valorParcela.toFixed(2),
      comecoPagamento: format(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), "dd/MM/yyyy"),
      taxa: `${(taxaAnual * 100).toFixed(2)}% a.a.`
    };
  };

  const calculateCredito = (value) => {
    const taxaMensal = 0.0499;
    const juros = value * taxaMensal;
    return {
      parcelas: 1,
      valorParcela: (value + juros).toFixed(2),
      comecoPagamento: "Na sua próxima fatura",
      taxa: `${(taxaMensal * 100).toFixed(2)}% a.m.`
    };
  };

  const calculatePagaDepois = (value) => {
    const taxaMensal = 0.0499;
    const juros = value * taxaMensal * 2;
    return {
      parcelas: 1,
      valorParcela: (value + juros).toFixed(2),
      comecoPagamento: "Daqui a 2 faturas",
      taxa: `${(taxaMensal * 100).toFixed(2)}% a.m.`
    };
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    let recommendation = "";
    let detail = "";
    let simulation = {};

    if (goal === "pagar-vista") {
      recommendation = "Pix na Conta";
      detail = `Pagamento à vista com saldo disponível, sem juros nem taxas.`;
      simulation = {
        parcelas: 1,
        valorParcela: parsedAmount.toFixed(2),
        comecoPagamento: "Hoje",
        taxa: "0%"
      };
    } else if (goal === "pagar-fatura") {
      recommendation = "Pix no Crédito";
      simulation = calculateCredito(parsedAmount);
      detail = `Lançado na fatura atual com incidência de juros mensais.`;
    } else if (goal === "parcelar") {
      recommendation = "Pix Parcelado";
      simulation = calculateParcelado(parsedAmount);
      detail = `Você poderá dividir o valor em até 12x, com início em 45 dias.`;
    } else if (goal === "adiar") {
      recommendation = "Pix Paga Depois";
      simulation = calculatePagaDepois(parsedAmount);
      detail = `Você escolhe pagar à vista até 2 faturas à frente.`;
    }

    setResult({ recommendation, detail, ...simulation });
    setStep(3);
  };

  return (
    <Card className="max-w-xl mx-auto p-6 mt-6">
      {step === 1 && (
        <CardContent className="space-y-4">
          <Label htmlFor="amount">Qual o valor do seu Pix?</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Digite o valor (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={() => setStep(2)} disabled={!amount}>Continuar</Button>
        </CardContent>
      )}

      {step === 2 && (
        <CardContent className="space-y-4">
          <Label>Como você prefere pagar?</Label>
          <RadioGroup onValueChange={setGoal}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pagar-vista" id="r1" />
              <Label htmlFor="r1">Tenho saldo e quero pagar à vista</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pagar-fatura" id="r2" />
              <Label htmlFor="r2">Quero pagar agora e resolver na fatura</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parcelar" id="r3" />
              <Label htmlFor="r3">Quero parcelar em várias vezes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="adiar" id="r4" />
              <Label htmlFor="r4">Quero adiar e pagar só depois</Label>
            </div>
          </RadioGroup>
          <Button onClick={handleSubmit} disabled={!goal}>Ver recomendação</Button>
        </CardContent>
      )}

      {step === 3 && result && (
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Recomendação: {result.recommendation}</h2>
          <p>{result.detail}</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Número de parcelas:</strong> {result.parcelas}</li>
            <li><strong>Valor da parcela:</strong> R$ {result.valorParcela}</li>
            <li><strong>Início do pagamento:</strong> {result.comecoPagamento}</li>
            <li><strong>Taxa aplicada:</strong> {result.taxa}</li>
          </ul>
          <Button onClick={() => { setStep(1); setResult(null); setGoal(""); setAmount(""); }}>Simular outro Pix</Button>
        </CardContent>
      )}
    </Card>
  );
}
