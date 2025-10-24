// Simulador lúdico baseado em quiz com simulação real de Pix ideal para o momento do cliente

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function PixQuizSimulator() {
  const [step, setStep] = useState(1);
  const [flow, setFlow] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState(6);
  const [faturaDelay, setFaturaDelay] = useState("30");
  const [result, setResult] = useState(null);

  const parseAmount = parseFloat(amount);

  const calculateIOF = (value, dias) => {
    return value * 0.0038 + value * 0.000082 * dias;
  };

  const simulate = (selectedFlow = flow) => {
    let recommendation = "";
    let detail = "";
    let simulation = {};
    const valor = parseAmount;

    if (selectedFlow === "vista") {
      recommendation = "Pix na Conta";
      simulation = {
        parcelas: 1,
        valorParcela: valor.toFixed(2),
        comecoPagamento: "Hoje",
        taxa: "0%"
      };
      detail = "Pagamento com saldo em conta, sem juros nem taxas.";
    }

    if (selectedFlow === "parcelado") {
      const taxaMensal = 0.0499;
      const iof = calculateIOF(valor, 45 * installments);
      const valorComIOF = valor + iof;
      const parcela = (valorComIOF * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -installments));
      simulation = {
        parcelas: installments,
        valorParcela: parcela.toFixed(2),
        comecoPagamento: format(new Date(Date.now() + 45 * 86400000), "dd/MM/yyyy"),
        taxa: `${(taxaMensal * 100).toFixed(2)}% a.m. + IOF`
      };
      recommendation = "Pix Parcelado";
      detail = `Divida o valor em até 12x sem travar o limite do seu cartão.`;
    }

    if (selectedFlow === "credito") {
      const taxaMensal = 0.0499;
      const juros = valor * taxaMensal;
      const iof = calculateIOF(valor, 30);
      const total = valor + juros + iof;
      simulation = {
        parcelas: 1,
        valorParcela: total.toFixed(2),
        comecoPagamento: "Fatura atual",
        taxa: `${(taxaMensal * 100).toFixed(2)}% a.m. + IOF`
      };
      recommendation = "Pix no Crédito";
      detail = `Use o limite do seu cartão e pague tudo na fatura atual.`;
    }

    if (selectedFlow === "paga-depois") {
      const taxaMensal = 0.0499;
      const meses = parseInt(faturaDelay) / 30;
      const valorComposto = valor * Math.pow(1 + taxaMensal, meses);
      const iof = calculateIOF(valor, parseInt(faturaDelay));
      const total = valorComposto + iof;
      simulation = {
        parcelas: 1,
        valorParcela: total.toFixed(2),
        comecoPagamento: `Fatura em ${faturaDelay} dias`,
        taxa: `${(taxaMensal * 100).toFixed(2)}% a.m. + IOF`
      };
      recommendation = "Pix Paga Depois";
      detail = `Pague daqui a ${faturaDelay} dias usando seu limite com tranquilidade.`;
    }

    setResult({ recommendation, detail, ...simulation });
    setStep(99);
  };

  return (
    <Card className="max-w-xl mx-auto p-6 mt-6">
      {step === 1 && (
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Qual o Pix ideal para o seu momento?</h2>
          <p>Responda 3 perguntinhas e a gente te mostra o melhor caminho ✨</p>
          <Label>1️⃣ Qual o valor do seu Pix?</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 1000" />
          <Button onClick={() => setStep(2)} disabled={!amount}>Continuar</Button>
        </CardContent>
      )}

      {step === 2 && (
        <CardContent className="space-y-4">
          <Label>2️⃣ Como está seu saldo hoje?</Label>
          <Button onClick={() => { setFlow("vista"); simulate("vista"); }}>Tenho saldo e quero pagar agora</Button>
          <Button onClick={() => setStep(3)}>Prefiro outro método de pagamento</Button>
        </CardContent>
      )}

      {step === 3 && (
        <CardContent className="space-y-4">
          <Label>3️⃣ Como você prefere se organizar para pagar?</Label>
          <Button onClick={() => setStep(4)}>Parcelar e pagar aos poucos</Button>
          <Button onClick={() => { setFlow("credito"); simulate("credito"); }}>Pagar tudo na fatura atual</Button>
          <Button onClick={() => setStep(5)}>Pagar de uma vez, mas mais pra frente</Button>
        </CardContent>
      )}

      {step === 4 && (
        <CardContent className="space-y-4">
          <Label>Em quantas parcelas?</Label>
          <Input type="number" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} min={2} max={12} />
          <Button onClick={() => { setFlow("parcelado"); simulate("parcelado"); }}>Simular Pix Parcelado</Button>
        </CardContent>
      )}

      {step === 5 && (
        <CardContent className="space-y-4">
          <Label>Pra quando você quer jogar esse pagamento?</Label>
          <Button onClick={() => { setFlow("paga-depois"); setFaturaDelay("30"); simulate("paga-depois"); }}>Próxima fatura (~30 dias)</Button>
          <Button onClick={() => { setFlow("paga-depois"); setFaturaDelay("60"); simulate("paga-depois"); }}>Fatura seguinte (~60 dias)</Button>
        </CardContent>
      )}

      {step === 99 && result && (
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">🎯 Recomendamos: {result.recommendation}</h2>
          <p>{result.detail}</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Parcelas:</strong> {result.parcelas}</li>
            <li><strong>Valor da parcela:</strong> R$ {result.valorParcela}</li>
            <li><strong>Início do pagamento:</strong> {result.comecoPagamento}</li>
            <li><strong>Taxa estimada:</strong> {result.taxa}</li>
          </ul>
          <Button onClick={() => { setStep(1); setFlow(""); setAmount(""); setResult(null); }}>Simular outro Pix</Button>
        </CardContent>
      )}
    </Card>
  );
}
