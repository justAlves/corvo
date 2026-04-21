import {
  BookOpen,
  Calendar,
  Clock,
  Filter,
  ShoppingCart,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

export const SITE = {
  name: "Corvo",
  tagline: "Assistente de IA no WhatsApp em 5 minutos",
  description:
    "Conecte seu WhatsApp, descreva seu negócio e receba uma assistente de IA que atende, agenda e vende — em minutos.",
  domain: "corvo.com.br",
} as const;

export type Promise_ = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export type HowStep = { k: string; title: string; body: string };

export type UseCase = { tag: string; title: string; body: string };

export type Plan = {
  name: string;
  price: string;
  period: string;
  body: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

export const NAV_LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#clientes", label: "Quem usa" },
  { href: "#preco", label: "Preço" },
] as const;

export const HERO = {
  eyebrow: "Assistente de IA no WhatsApp",
  h1Before: "Sua assistente pronta em",
  h1Accent: "5 minutos.",
  h1After: "Séria.",
  sub: "Conecta o WhatsApp, conta do seu negócio, e pronto — a IA responde cliente, agenda horário, tira dúvida e fecha venda. Sem código, sem complicação.",
  ctaPrimary: "Criar minha assistente",
  ctaSecondary: "Ver como funciona",
  socialProof: "Já rodando em 1.240+ comércios, clínicas e lojas",
} as const;

export const PROMISES: Promise_[] = [
  {
    title: "Responde 24/7",
    body: "Nenhum cliente fica no vácuo — nem às 2h da manhã de um sábado.",
    icon: Clock,
  },
  {
    title: "Agenda sozinha",
    body: "Conversa com o cliente, propõe horários, marca direto na sua agenda.",
    icon: Calendar,
  },
  {
    title: "Qualifica leads",
    body: "Filtra curioso de cliente-de-verdade e passa o bastão pro vendedor.",
    icon: Filter,
  },
  {
    title: "Tira dúvida de produto",
    body: "Ela aprende seu catálogo, cardápio ou serviços. E não inventa.",
    icon: BookOpen,
  },
  {
    title: "Fecha venda no chat",
    body: "Gera link de pagamento, confirma pedido, avisa quando sai pra entrega.",
    icon: ShoppingCart,
  },
  {
    title: "Entrega pro humano",
    body: "Quando fica complicado, ela chama você. Sem sumir com o cliente.",
    icon: UserRoundCheck,
  },
];

export const HOW = {
  title: "5 minutos, 4 passos.",
  subtitle:
    "A gente pega leve — mas você acaba com uma assistente de verdade no final.",
  steps: [
    {
      k: "01",
      title: "Conecta o WhatsApp",
      body: "Escaneia o QR code ou plugamos via API oficial. Não precisa trocar de número.",
    },
    {
      k: "02",
      title: "Fala do seu negócio",
      body: "Nome, endereço, horário de atendimento, o que você vende. Dá pra importar do seu site.",
    },
    {
      k: "03",
      title: "Escolhe a personalidade",
      body: "Nome da assistente, tom de voz, avatar. Ela pode ser formal, descolada, direta — você decide.",
    },
    {
      k: "04",
      title: "Testa e publica",
      body: "Conversa com ela no playground, ajusta o que quiser e coloca pra atender de verdade.",
    },
  ] satisfies HowStep[],
} as const;

export const USE_CASES = {
  title: "Pra qualquer negócio que conversa no WhatsApp.",
  items: [
    {
      tag: "Clínica",
      title: "Odonto Sorriso",
      body: "Agenda 40% das consultas fora do horário comercial.",
    },
    {
      tag: "Restaurante",
      title: "Cantina do Sílvio",
      body: "Fecha pedido de delivery sozinha, integrada ao iFood.",
    },
    {
      tag: "Pet shop",
      title: "Au-Au Mix",
      body: "Tira dúvida de ração, confirma banho e tosa, lembra do antipulgas.",
    },
    {
      tag: "Estética",
      title: "Studio Alma",
      body: "Reserva horário, envia preparo pré-procedimento, confirma no dia.",
    },
    {
      tag: "E-commerce",
      title: "Bazar Três Lagoas",
      body: "Recupera carrinho abandonado e responde rastreio na hora.",
    },
    {
      tag: "Imobiliária",
      title: "Lar & Chave",
      body: "Qualifica interessado, agenda visita e passa só o quente pro corretor.",
    },
  ] satisfies UseCase[],
} as const;

export const PRICING = {
  title: "Preço honesto, sem pegadinha.",
  plans: [
    {
      name: "Teste",
      price: "R$ 0",
      period: "por 7 dias",
      body: "Pra você sentir. Sem cartão.",
      features: [
        "1 assistente",
        "Até 100 conversas",
        "Playground completo",
        "Suporte por e-mail",
      ],
      cta: "Começar",
      highlight: false,
    },
    {
      name: "Negócio",
      price: "R$ 149",
      period: "por mês",
      body: "Pro dia-a-dia de quem atende muito.",
      features: [
        "1 assistente",
        "Conversas ilimitadas",
        "Agenda + pagamento",
        "Handoff pra humano",
        "Métricas e histórico",
      ],
      cta: "Assinar",
      highlight: true,
    },
    {
      name: "Rede",
      price: "R$ 449",
      period: "por mês",
      body: "Pra quem tem várias unidades ou marcas.",
      features: [
        "Até 5 assistentes",
        "Multiusuário",
        "API e webhooks",
        "Atendente prioritário",
        "SLA 99,9%",
      ],
      cta: "Falar com a gente",
      highlight: false,
    },
  ] satisfies Plan[],
  footnote:
    "Todos os planos incluem WhatsApp oficial (Meta), sem taxa de sessão.",
} as const;

export const FOOT_CTA = {
  title: "Sua assistente tá esperando.",
  body: "Leva mesmo 5 minutos. A gente cronometrou.",
  button: "Começar agora",
} as const;
