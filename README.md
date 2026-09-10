# VRD Pisos Industriais

Site institucional estático em português, com navegação responsiva, três seções principais, abas de serviço acessíveis por teclado, galeria em modal, formulário que prepara mensagem para WhatsApp, mapa carregado sob demanda, perguntas frequentes e aviso de privacidade. Sem dependências de produção.

## Uso

`npm run dev` inicia em 3000. `npm run build` verifica a sintaxe do JavaScript. O build copia `public` para `out`, o diretório publicado.

## Conteúdo e origem

- Nome, CNPJ e endereço: contrato VRD recuperado dos materiais do usuário. Rua Moacyr Domingues, 22, São José, Canoas/RS, CNPJ 54.888.864/0001-10. Não foram incluídos valores contratuais ou dados da prestadora.
- Logo: Logotipo VRD Pisos Industriais 3D.png, encontrado nos materiais do usuário. A paleta foi ajustada ao azul com o magenta presente na marca.
- Instagram: https://www.instagram.com/vrd.pisosindustriais/ informado pelo usuário no contexto.
- WhatsApp informado pelo usuário: 5199017137, exibido como (51) 9901-7137 e aplicado sem acrescentar dígitos (link com prefixo do Brasil: 555199017137). Tem 10 dígitos com DDD; a necessidade de conferência foi sinalizada.
- E-mail informado pelo usuário: vrdpisosindustriais@gmail.com, com link mailto na seção de contato e nos dados estruturados.
- Serviços: catálogo inicial para validação (pisos de concreto, polimento/acabamento, recuperação). Sem números de obras, prazos, certificações, garantias ou abrangência de atendimento inventados.
- Imagem do galpão gerada por IA para ilustração, com identificação na página. Galeria usa três enquadramentos da mesma referência, sem afirmar que são obras realizadas.
- Depoimentos: espaço reservado e identificado, sem avaliações fictícias.

## Contato

O formulário monta uma mensagem no navegador, permite revisão e abre o WhatsApp do número configurado. Nenhum dado é salvo em servidor. Não há envio automático de mensagens, e-mail, CRM ou banco de dados. A área em m² aceita valores positivos. Para trocar o WhatsApp, atualizar `phone` em `public/app.js` e o link/texto em `public/index.html`.

## Privacidade e publicação

Criado para hospedagem restrita ao proprietário. A restrição de acesso é aplicada pela plataforma; meta robots e robots.txt também impedem indexação. Não alterar o acesso sem autorização expressa. Dados estruturados e Open Graph estão prontos; telefone provisório não integra o JSON-LD. Canonical e imagem social apontam para a URL privada atual.

Antes de uma eventual publicação pública, confirmar o telefone, a lista de serviços, fotos e depoimentos reais e remover os avisos de revisão; atualizar domínio/canonical e diretivas de indexação conforme aprovação do proprietário.
