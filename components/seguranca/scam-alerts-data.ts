export interface ScamAlertItem {
  id: string;
  quote: string;
  explanation: string;
}

export const SCAM_ALERT_ITEMS: readonly ScamAlertItem[] = [
  {
    id: "novo-numero",
    quote: "“Esse é o meu novo número de WhatsApp.”",
    explanation:
      "Desconfie sempre. Antes de responder, confirme diretamente pelos canais oficiais do escritório.",
  },
  {
    id: "pix-indenizacao",
    quote:
      "“Ganharam o processo e você precisa fazer um Pix para liberar o valor.”",
    explanation:
      "Golpistas costumam prometer indenizações ou liberações judiciais e, em seguida, pedem pagamento imediato. Não faça transferências sem confirmação expressa do escritório.",
  },
  {
    id: "audiencia-urgente",
    quote:
      "“Vai ter uma audiência urgente agora no STF, no STJ, no Tribunal ou com o juiz.”",
    explanation:
      "A criação de urgência é uma estratégia para impedir que você pense com calma. Desconfie de mensagens alarmistas e aguarde o retorno do escritório.",
  },
  {
    id: "link-compartilhar-tela",
    quote:
      "“Clique neste link”, “compartilhe sua tela” ou “instale este aplicativo”.",
    explanation:
      "Esses pedidos podem resultar em invasão de conta, furto de dados e prejuízo financeiro. Não clique, não instale e não compartilhe nada.",
  },
] as const;
