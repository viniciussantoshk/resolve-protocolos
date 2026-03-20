const { poolPromise, sql } = require('./src/config/db');

// 1. O Wrapper Principal
function ezzeEmail(bodyContent) {
  return `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div style="padding: 32px 32px 24px 32px; color: #334155; font-size: 15px; line-height: 1.6;">
    ${bodyContent}
  </div>
  <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 11.5px; color: #94a3b8; margin: 0 0 20px 0; line-height: 1.5;">
      ***Esta é uma mensagem automática, então pedimos a gentileza de não respondê-la, pois não conseguiremos ler sua resposta por aqui.***
    </p>
    <img src="https://protocolos.resolveassist.com.br/assets/logo-ezze.jpeg" alt="Ezze Seguros" width="120" style="display: block; margin: 0 auto; outline: none; text-decoration: none; border: none;">
  </div>
</div>`;
}

// 2. O Componente do Protocolo
function protocolCard(borderColor, bgColor, title, protocolNumber) {
  return `<div style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">${title}</p>
    <p style="margin: 6px 0 0 0; font-size: 24px; font-weight: 800; color: ${borderColor}; font-family: monospace;">${protocolNumber}</p>
  </div>`;
}

// 3. A LISTA COMPLETA DOS 22 MODELOS OFICIAIS
const templates = [
  // ─── BLOCO 1: ASSISTÊNCIA, OUVIDORIA E SAC ───
  {
    name: 'Assistência (Geral)', icon: '🚗', subject: 'Protocolo de Assistência {{protocolo}} — Ezze Seguros', description: 'Envio padrão de protocolo de assistência.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#2596be', '#f0f9ff', 'NÚMERO DO PROTOCOLO DA ASSISTÊNCIA', '{{protocolo}}')}
      <p style="margin-bottom:0;">A previsão inicial é de <strong>{{previsao}} minutos</strong>, havendo alteração retornaremos o contato.</p>
    `)
  },
  {
    name: 'Assistência — Reembolso (Demais)', icon: '💰', subject: 'Análise de Reembolso {{protocolo}} — Ezze Seguros', description: 'Orientações para solicitação de reembolso de remoção.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>. Somos da Ezze Seguros.</p>
      <p>Conforme conversamos, segue e-mail para enviar a documentação para a solicitação de análise de reembolso.</p>
      ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>Enviar e-mail para: <a href="mailto:qualidade@resolveassist.com.br" style="color:#2596be; font-weight:bold; text-decoration:none;">qualidade@resolveassist.com.br</a></p>
      <p>O reembolso será analisado de acordo com a cobertura da apólice, com limite de até <strong>{{limite_km}} km</strong> referente à remoção do veículo.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; font-weight:bold; color:#0f172a; font-size:14px;">Para profissionais autônomos, é necessário:</p>
        <ul style="margin-bottom:0; padding-left:20px; color:#475569; font-size:14px; line-height:1.7;">
          <li>Recibo de Profissional Autônomo</li>
          <li>Nome completo do profissional que realizou o serviço</li>
          <li>CNPJ (mesmo que seja MEI)</li>
          <li>Data de nascimento do prestador</li>
          <li>Telefones de contato e e-mail do prestador, se houver</li>
          <li>Fotos do serviço antes e depois da execução</li>
        </ul>
      </div>
      <p>O prazo para análise é de até <strong>5 dias úteis</strong>, contados a partir do envio da solicitação.</p>
      <p style="margin-bottom:0;">Qualquer dúvida, estamos à disposição na central de atendimento através do <strong>0800 983 3993</strong>.</p>
    `)
  },
  {
    name: 'Assistência — Reembolso Funeral', icon: '🕊️', subject: 'Análise de Reembolso Funeral {{protocolo}} — Ezze Seguros', description: 'Documentação para assistência funeral.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>. Somos da Ezze Seguros.</p>
      <p>Conforme conversamos, segue e-mail para enviar a documentação para a solicitação de análise de reembolso.</p>
      ${protocolCard('#4f46e5', '#eef2ff', 'PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>Enviar e-mail para: <a href="mailto:qualidade@resolveassist.com.br" style="color:#4f46e5; font-weight:bold; text-decoration:none;">qualidade@resolveassist.com.br</a></p>
      <p>O reembolso será analisado de acordo com a cobertura da apólice, com limite de até <strong>{{limite_km}}</strong> referente à assistência funeral.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; font-weight:bold; color:#0f172a; font-size:14px;">Documentos necessários:</p>
        <ul style="margin-bottom:0; padding-left:20px; color:#475569; font-size:14px; line-height:1.7;">
          <li>Nota Fiscal</li>
          <li>Dados Bancários</li>
          <li>Certidão de Óbito</li>
          <li>RG e CPF do falecido</li>
          <li>RG e CPF de quem receberá o Reembolso</li>
          <li>Documento de comprovação de vínculo do familiar com o titular</li>
        </ul>
      </div>
      <p>O prazo para análise é de até <strong>5 dias úteis</strong>.</p>
      <p style="margin-bottom:0;">Qualquer dúvida, estamos à disposição na central de atendimento através do <strong>0800 983 3993</strong>.</p>
    `)
  },
  {
    name: 'Assistência — Reembolso PET', icon: '🐾', subject: 'Análise de Reembolso PET {{protocolo}} — Ezze Seguros', description: 'Reembolso para assistência Pet.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>. Somos da Ezze Seguros.</p>
      <p>Conforme conversamos, segue e-mail para enviar a documentação para a solicitação de análise de reembolso.</p>
      ${protocolCard('#d97706', '#fffbeb', 'PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>Enviar e-mail para: <a href="mailto:qualidade@resolveassist.com.br" style="color:#d97706; font-weight:bold; text-decoration:none;">qualidade@resolveassist.com.br</a></p>
      <p>O reembolso será analisado de acordo com a cobertura da apólice.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; font-weight:bold; color:#0f172a; font-size:14px;">Para análise, é necessário:</p>
        <ul style="margin-bottom:12px; padding-left:20px; color:#475569; font-size:14px; line-height:1.7;">
          <li>Nota Fiscal</li>
          <li>Dados Bancários</li>
          <li>Comprovante de dados bancários</li>
        </ul>
        <p style="margin-bottom:0; color:#dc2626; font-size:13px; background-color:#fef2f2; padding:8px 12px; border-radius:6px; border-left:3px solid #dc2626;"><strong>Importante:</strong> Somente serão aceitas notas emitidas por prestadores com CNPJ.</p>
      </div>
      <p>O prazo para análise é de até <strong>5 dias úteis</strong>.</p>
      <p style="margin-bottom:0;">Qualquer dúvida ligue <strong>0800 983 3993</strong>.</p>
    `)
  },
  {
    name: 'Assistência — Locação de Caçamba', icon: '🏗️', subject: 'Locação de Caçamba {{protocolo}} — Ezze Seguros', description: 'Regras e restrições para locação de caçamba.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em <strong>{{data_atendimento}}</strong>.</p>
      ${protocolCard('#16a34a', '#f0fdf4', 'PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>O agendamento está previsto para <strong>{{previsao}}</strong>.</p>
      <p>Abaixo, seguem as orientações necessárias para o serviço de locação de caçamba:</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color:#16a34a; font-weight:bold; margin:0 0 6px 0; font-size:14px;">✅ Entulhos Permitidos:</p>
        <p style="margin-top:0; font-size:13.5px; color:#475569;">Somente é permitido descartar resíduos provenientes de reforma e construção civil, tais como: componentes cerâmicos (tijolos, blocos, telhas, placas de revestimento), argamassa, concreto, pedra, areia, terra.</p>
        
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;">
        
        <p style="color:#dc2626; font-weight:bold; margin:0 0 6px 0; font-size:14px;">❌ Não é Permitido:</p>
        <p style="margin:0; font-size:13.5px; color:#475569;">Descartar madeira (incluindo móveis), lixo orgânico ou qualquer resíduo que não seja de obra. Mudar a caçamba de lugar após ser posicionada pelo prestador.</p>
      </div>
      <p style="font-weight:bold; color:#0f172a; margin-bottom:4px; font-size:14px;">Presença no Local</p>
      <p style="margin-top:0; font-size:13.5px; color:#475569;">É obrigatório que o solicitante ou um responsável indicado esteja no local para receber a caçamba.</p>
      <p style="font-weight:bold; color:#0f172a; margin-bottom:4px; font-size:14px;">Limite de Carga</p>
      <p style="margin-top:0; font-size:13.5px; color:#475569;">A carga deve permanecer até a borda superior da caçamba, sem ultrapassar o limite. Em caso de excesso, o material excedente deverá ser retirado pelo solicitante.</p>
    `)
  },
  {
    name: 'Ouvidoria', icon: '⚖️', subject: 'Protocolo de Ouvidoria {{protocolo}} — Ezze Seguros', description: 'Abertura de ticket na Ouvidoria.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#db2777', '#fdf2f8', 'NÚMERO DO PROTOCOLO DA OUVIDORIA', '{{protocolo}}')}
      <p>Prazo de retorno de até <strong>15 dias corridos</strong>.</p>
      <p style="margin-bottom:0; font-size:13px; color:#64748b; font-style:italic;">Caso seja necessária alguma informação/documento complementar, o prazo será suspenso e voltará a correr assim que forem entregues as informações solicitadas.</p>
    `)
  },
  {
    name: 'Apólices BMW (2ª via)', icon: '🚙', subject: '2ª via de Apólice BMW {{protocolo}} — Ezze Seguros', description: 'Envio de PDF com senha para apólices BMW.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#334155', '#f8fafc', 'PROTOCOLO DO ATENDIMENTO (ZENDESK)', '{{protocolo}}')}
      <p>Segue em anexo o <strong>PDF da sua apólice</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="margin:0; color:#475569; font-size:14px;">Para acessá-lo, basta inserir os<br><strong style="font-size:16px; color:#0f172a; display:inline-block; margin-top:8px;">5 (cinco) primeiros números do seu CPF</strong>.</p>
      </div>
    `)
  },
  {
    name: 'SAC — Reclamação', icon: '🗣️', subject: 'Protocolo SAC (Reclamação) {{protocolo}} — Ezze Seguros', description: 'Protocolo de Reclamação SAC (7 dias).',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#ea580c', '#fff7ed', 'NÚMERO DO PROTOCOLO DO SAC', '{{protocolo}}')}
      <p style="margin-bottom:0;">Prazo de retorno de até <strong>7 dias corridos</strong>.</p>
    `)
  },
  {
    name: 'SAC — Solicitações', icon: '📝', subject: 'Protocolo SAC (Solicitação) {{protocolo}} — Ezze Seguros', description: 'Protocolo de Solicitação SAC (7 dias).',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#ea580c', '#fff7ed', 'NÚMERO DO PROTOCOLO DA SOLICITAÇÃO', '{{protocolo}}')}
      <p style="margin-bottom:0;">Prazo de retorno de até <strong>7 dias corridos</strong>.</p>
    `)
  },
  {
    name: 'SAC — MAXIVIDA', icon: '🏥', subject: 'Protocolo MAXIVIDA {{protocolo}} — Ezze Seguros', description: 'Protocolo exclusivo MAXIVIDA (3 dias).',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#0d9488', '#f0fdfa', 'NÚMERO DO PROTOCOLO DA SOLICITAÇÃO', '{{protocolo}}')}
      <p style="margin-bottom:0;">Prazo de retorno de até <strong>3 dias úteis</strong>.</p>
    `)
  },

  // ─── BLOCO 2: SINISTROS ───
  {
    name: 'Sinistro Auto — Segurado', icon: '🚗', subject: 'Protocolo de Sinistro Auto {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para o segurado auto.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#0284c7', '#e0f2fe', 'NÚMERO DO PROTOCOLO DO SINISTRO', '{{protocolo}}')}
      <p>O prazo para realização da vistoria é de até <strong>3 dias úteis</strong>, sendo necessário deixar o veículo na oficina no primeiro horário.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin:0; font-size:14px; color:#475569;">Para que o terceiro comunique o sinistro, é necessário informar o número do seu protocolo e a placa do seu veículo. Com esses dados, o terceiro conseguirá registrar o sinistro dele.</p>
      </div>
    `)
  },
  {
    name: 'Sinistro Auto — Terceiro', icon: '🚘', subject: 'Protocolo de Sinistro Auto Terceiro {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para terceiros.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#0369a1', '#e0f2fe', 'NÚMERO DO PROTOCOLO DO SINISTRO', '{{protocolo}}')}
      <p>Para enviar a documentação, acesse o link:<br>
      <a href="https://ezzeseguros.com.br/fale-conosco.html" style="color:#0369a1; font-weight:bold; text-decoration:none;">https://ezzeseguros.com.br/fale-conosco.html</a></p>
      <p style="margin-bottom:0;">A reguladora SDS entrará em contato em até <strong>24 horas úteis</strong>. Será enviado um link para que você insira as fotos do veículo.</p>
    `)
  },
  {
    name: 'Sinistro Empresarial', icon: '🏢', subject: 'Protocolo de Sinistro Empresarial {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para conta empresarial.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#475569', '#f1f5f9', 'NÚMERO DO PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>O analista responsável fará contato por e-mail em <strong>2 dias úteis</strong> solicitando documentação.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; color:#0f172a; font-weight:bold; font-size:14px;">Em caso de dúvidas:</p>
        <p style="margin:0; font-size:14px; color:#475569;">O contato relacionado ao sinistro deverá ser feito exclusivamente pelo e-mail:<br>
        <a href="mailto:sinistros@ezzeseguros.com.br" style="color:#475569; font-weight:bold;">sinistros@ezzeseguros.com.br</a></p>
        <p style="margin:10px 0 0 0; font-size:13px; color:#dc2626;"><strong>Atenção:</strong> Coloque no assunto do e-mail o CNPJ e o nome completo do titular (Empresa).</p>
      </div>
    `)
  },
  {
    name: 'Sinistro Garantia Estendida', icon: '🛡️', subject: 'Protocolo de Garantia Estendida {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para acionamento de garantia.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#8b5cf6', '#f5f3ff', 'NÚMERO DO PROTOCOLO DO SINISTRO', '{{protocolo}}')}
      <p style="margin-bottom:0;">A assistência técnica entrará em contato em até <strong>2 dias úteis</strong>. Caso não receba o contato, você poderá ligar para o número indicado na sua apólice.</p>
    `)
  },
  {
    name: 'Sinistro Lucro Cessantes', icon: '📉', subject: 'Protocolo de Sinistro Lucro Cessantes {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para Lucros Cessantes.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#c026d3', '#fdf4ff', 'NÚMERO DO PROTOCOLO DO SINISTRO', '{{protocolo}}')}
      <p style="margin-bottom:0;">Para enviar a listagem de documentos acesse o link:<br>
      <a href="https://ezzeseguros.com.br/fale-conosco.html" style="color:#c026d3; font-weight:bold; text-decoration:none;">https://ezzeseguros.com.br/fale-conosco.html</a></p>
    `)
  },
  {
    name: 'Sinistro Prestamista — SuperSim', icon: '📱', subject: 'Protocolo de Sinistro Prestamista {{protocolo}} — Ezze Seguros', description: 'Sinistro Prestamista via Zendesk (SuperSim).',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#10b981', '#ecfdf5', 'NÚMERO DO PROTOCOLO (ZENDESK)', '{{protocolo}}')}
      <p>Por favor, encaminhe a listagem de documentos (de acordo com o evento ocorrido) através do link:<br>
      <a href="https://ezze-seguros.zendesk.com/hc/pt-br" style="color:#10b981; font-weight:bold; text-decoration:none;">https://ezze-seguros.zendesk.com/hc/pt-br</a></p>
      <p style="margin-bottom:0;">Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
    `)
  },
  {
    name: 'Sinistro Prestamista — Não Localizado', icon: '🔍', subject: 'Protocolo de Sinistro Prestamista {{protocolo}} — Ezze Seguros', description: 'Sinistro Prestamista não localizado no Stamina.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#f59e0b', '#fffbeb', 'NÚMERO DO PROTOCOLO (ZENDESK)', '{{protocolo}}')}
      <p>Por favor, encaminhe a listagem de documentos através do link:<br>
      <a href="https://ezze-seguros.zendesk.com/hc/pt-br" style="color:#f59e0b; font-weight:bold; text-decoration:none;">https://ezze-seguros.zendesk.com/hc/pt-br</a></p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; font-weight:bold; color:#0f172a; font-size:14px;">Listagem de documentos necessários:</p>
        <ul style="margin-bottom:0; padding-left:20px; color:#475569; font-size:14px; line-height:1.7;">
          <li>Documento de Identidade (RG e CPF ou CNH) do titular do seguro</li>
          <li>Nota fiscal do produto</li>
          <li>Comprovante de endereço do titular do seguro</li>
          <li>Bilhete de seguro</li>
        </ul>
      </div>
    `)
  },
  {
    name: 'Sinistro Residencial', icon: '🏠', subject: 'Protocolo de Sinistro Residencial {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para o seguro residencial.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#b45309', '#fffbeb', 'NÚMERO DO PROTOCOLO (FÊNIX)', '{{protocolo}}')}
      <p>Por favor, encaminhe a listagem de documentos através do link:<br>
      <a href="https://ezze-seguros.zendesk.com/hc/pt-br" style="color:#b45309; font-weight:bold; text-decoration:none;">https://ezze-seguros.zendesk.com/hc/pt-br</a></p>
      <p style="margin-bottom:0;">O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação pertinente ao seu evento.</p>
    `)
  },
  {
    name: 'Sinistro Terceiro — Congênere', icon: '🤝', subject: 'Protocolo de Sinistro Terceiro {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro Segurado Terceiro na Congênere.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#3b82f6', '#eff6ff', 'NÚMERO DO PROTOCOLO DO SINISTRO', '{{protocolo}}')}
      <p style="margin-bottom:0;">Para enviar o orçamento acesse o link:<br>
      <a href="https://ezzeseguros.com.br/fale-conosco.html" style="color:#3b82f6; font-weight:bold; text-decoration:none;">https://ezzeseguros.com.br/fale-conosco.html</a></p>
    `)
  },
  {
    name: 'Sinistro de Vida', icon: '❤️', subject: 'Protocolo de Sinistro de Vida {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro para o Seguro de Vida.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#e11d48', '#fff1f2', 'NÚMERO DO PROTOCOLO (GENESYS)', '{{protocolo}}')}
      <p>Por favor, encaminhe a listagem de documentos através do link:<br>
      <a href="https://ezze-seguros.zendesk.com/hc/pt-br" style="color:#e11d48; font-weight:bold; text-decoration:none;">https://ezze-seguros.zendesk.com/hc/pt-br</a></p>
      <p style="margin-bottom:0;">Após o recebimento e validação, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
    `)
  },
  {
        name: 'Sinistro - Bolsa Protegida', icon: '👜', subject: 'Abertura de Sinistro: Bolsa Protegida',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Nota fiscal dos objetos furtados</li>
            <li>Boletim de ocorrência (contendo itens furtados)</li>
            <li>Se celular foi furtado, orientar segurado a fazer o bloqueio do IMEI do aparelho junto à operadora</li>
            <li>Comprovante de bloqueio do cartão (conta utilizada para pagar o Sem Parar)</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Compra com Cartão', icon: '💳', subject: 'Abertura de Sinistro: Compra com Cartão',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Extrato bancário dos últimos 3 meses anteriores à data da ocorrência</li>
            <li>Boletim de ocorrência (contendo itens furtados)</li>
            <li>Comprovante de bloqueio do cartão (conta utilizada para pagar o Sem Parar)</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista IFTT (Genesys)', icon: '🩺', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida IFTT',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Comprovante da atividade remunerada exercida (Extrato do MEI, declaração de Imposto de Renda ou Guia de Comprovação de Pagamento do INSS)</li>
            <li>Laudo/Atestado de afastamento</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista IFTT (Stamina)', icon: '🩺', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida IFTT',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (STAMINA)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo <strong>no link que recebeu no seu e-mail.</strong></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Comprovante da atividade remunerada exercida (Extrato do MEI, declaração de Imposto de Renda ou Guia de Comprovação de Pagamento do INSS)</li>
            <li>Laudo/Atestado de afastamento</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista IPA (Genesys)', icon: '🏥', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida IPA',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Boletim de ocorrência (se houver)</li>
            <li>Laudo de invalidez c/ alta médica</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista IPA (Stamina)', icon: '🏥', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida IPA',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (STAMINA)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo <strong>no link que recebeu no seu e-mail.</strong></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Boletim de ocorrência (se houver)</li>
            <li>Laudo de invalidez c/ alta médica</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - IPA Vítima de Crime', icon: '⚖️', subject: 'Abertura de Sinistro: IPA - Vítima de Crime',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Boletim de ocorrência</li>
            <li>Laudo de invalidez c/ alta médica</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Morte Acidental Vítima de Crime', icon: '🕊️', subject: 'Abertura de Sinistro: Morte Acidental',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Certidão de Óbito</li>
            <li>Documento pessoal com foto do titular do seguro</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Boletim de ocorrência</li>
            <li>Laudo do IML</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - PIX sob Coação', icon: '📱', subject: 'Abertura de Sinistro: PIX sob Coação',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Comprovante da transação (original e assinado pelo banco)</li>
            <li>Extrato bancário dos últimos 3 meses anteriores à data da ocorrência</li>
            <li>Boletim de ocorrência</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista Desemprego (Genesys)', icon: '💼', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida - Desemprego',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Termo de rescisão de contrato de trabalho</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Chave FGTS rescisão</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista Desemprego (Stamina)', icon: '💼', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida - Desemprego',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (ZENDESK)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Termo de rescisão de contrato de trabalho</li>
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Chave FGTS rescisão</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista Morte (Genesys)', icon: '🕊️', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida - Morte',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Certidão de Óbito</li>
            <li>Documento pessoal com foto do titular do seguro</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Prestamista Morte (Stamina)', icon: '🕊️', subject: 'Abertura de Sinistro: Prestamista/Renda Garantida - Morte',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (STAMINA)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo <strong>no link que recebeu no seu e-mail.</strong></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Certidão de Óbito</li>
            <li>Documento pessoal com foto do titular do seguro</li>
            <li>Comprovante de endereço atualizado</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Danos Elétricos', icon: '⚡', subject: 'Abertura de Sinistro Residencial: Danos Elétricos',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Protocolo junto a concessionária de energia (em caso de problemas decorrentes do fornecimento de energia da concessionaria)</li>
            <li>Orçamento discriminado para equipamentos com impossibilidade de reparos (idêntico ao danificado, marca e modelo ou similar em caso de descontinuidade)</li>
            <li>Laudo técnico discriminado, da Assistência Técnica, contendo peças e mão de obra para os reparos do equipamento danificado, ou parecer de impossibilidade de reparos</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Fotos frontal dos bens atingidos/danificados e da etiqueta de identificação (marca, modelo e nº série)</li>
            <li>Declaração de salvados (anexo) caso haja equipamentos sem condições de reparo</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Equip. Eletrônicos', icon: '💻', subject: 'Abertura de Sinistro Residencial: Equipamentos Eletrônicos',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Protocolo junto a concessionária de energia (em caso de problemas decorrentes do fornecimento de energia da concessionaria)</li>
            <li>Orçamento discriminado para equipamentos com impossibilidade de reparos (idêntico ao danificado, marca e modelo ou similar em caso de descontinuidade)</li>
            <li>Laudo técnico discriminado, da Assistência Técnica, contendo peças e mão de obra para os reparos do equipamento danificado, ou parecer de impossibilidade de reparos</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Fotos frontal dos bens atingidos/danificados e da etiqueta de identificação (marca, modelo e nº série)</li>
            <li>Declaração de salvados (anexo) caso haja equipamentos sem condições de reparo</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Incêndio/Explosão', icon: '🔥', subject: 'Abertura de Sinistro Residencial: Incêndio, Raio ou Explosão',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Cópia de NF do orçamento de reparo dos danos</li>
            <li>Cópia de dados bancários em titularidade do segurado</li>
            <li>Boletim de ocorrência (OBRIGATÓRIO, em caso de incêndio)</li>
            <li>Declaração de inexistência de outros seguros e autorização de crédito em conta</li>
            <li>Comprovação de propriedade e/ou de posse do imóvel segurado (interesse segurado, conforme o caso) onde ocorreu o sinistro e, se for o caso, o respectivo contrato de aluguel</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong>.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Quebra de Vidros/Mármore', icon: '🪟', subject: 'Abertura de Sinistro Residencial: Quebra de Vidros, Mármore e Granitos',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Foto do vidro danificado (se possuir)</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Orçamento discriminado de materiais (com metragem e quantidades) e mão de obra</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Roubo e Furto', icon: '🥷', subject: 'Abertura de Sinistro Residencial: Roubo e Furto',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Fotos dos danos causados, telhas, forro, móveis atingidos/danificados</li>
            <li>Orçamento discriminado de materiais (com metragem e quantidades) e mão de obra</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Ruptura de Tubulação', icon: '🚰', subject: 'Abertura de Sinistro Residencial: Ruptura de Tubulação',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Foto do dano (se possuir)</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Orçamento discriminado de materiais (com metragem e quantidades) e mão de obra</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Residencial Vendaval e Ciclone', icon: '🌪️', subject: 'Abertura de Sinistro Residencial: Vendaval, Ciclone, Tornado e Granizo',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (FÊNIX)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhe a listagem de documentos através do link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>RG/CPF do Segurado</li>
            <li>Comprovante de endereço (conta consumo), no nome do segurado</li>
            <li>Declaração de existência/inexistência de outros seguros (pode ser feito à mão, assinado e datado no final)</li>
            <li>Documento demonstrando os Dados Bancários no CPF do segurado: Nome do Banco / Agência e Conta com dígito</li>
            <li>Reclamação formal de prejuízos detalhada (pode ser feito à mão, assinado e datado no final), contendo narrativa breve do evento</li>
            <li>Fotos dos danos causados, telhas, forro, móveis atingidos/danificados</li>
            <li>Orçamento discriminado de materiais (com metragem e quantidades) e mão de obra</li>
          </ul>
          <p>O regulador fará contato por e-mail em <strong>5 dias úteis</strong> solicitando a documentação.</p>
        `)
    },
    {
        name: 'Sinistro - Roubo Após Saque', icon: '🏧', subject: 'Abertura de Sinistro: Roubo Após Saque',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Comprovante do saque (original e assinado pelo banco) ou foto original do extrato do saque (canhoto do caixa eletrônico)</li>
            <li>Extrato bancário dos últimos 3 meses anteriores à data da ocorrência</li>
            <li>Boletim de ocorrência (contendo itens furtados)</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro - Saque Sob Coação', icon: '😰', subject: 'Abertura de Sinistro: Saque Sob Coação',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          <p style="margin-bottom: 4px;"><strong>Listagem de documentos:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Documento pessoal com foto</li>
            <li>Comprovante de endereço atualizado</li>
            <li>Comprovante do saque (original e assinado pelo banco) ou foto original do extrato do saque (canhoto do caixa eletrônico)</li>
            <li>Extrato bancário dos últimos 3 meses anteriores à data da ocorrência</li>
            <li>Boletim de ocorrência (contendo itens furtados)</li>
            <li>Dados bancários do titular do seguro</li>
          </ul>
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro Vida - IFPD', icon: '🏥', subject: 'Abertura de Sinistro Vida: Invalidez Funcional Permanente e Total por Doença (IFPD)',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          
          <p style="margin-bottom: 4px;"><strong>Documentos do Segurado:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Cópia do RG, CPF e comprovante de residência em nome do titular</li>
            <li>Relatório médico informando data do(s) diagnóstico(s) das doenças, tratamento realizado, prescrições futuras, se foram esgotadas todas as possibilidades terapêuticas para o caso e a data da caracterização da invalidez como total e definitiva</li>
            <li>Relatórios e exames originais médicos que comprovem a invalidez</li>
          </ul>

          <p style="margin-bottom: 4px;"><strong>Documentos do Estipulante/Empresa:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Cópia da Ficha de Registro de Empregado, no caso de funcionário empregado</li>
            <li>Cópia dos 3 últimos holerites imediatamente anteriores à data da ocorrência do sinistro, no caso de funcionário empregado</li>
            <li>Cópia do CAGED (Cadastro Geral de Empregados e Desempregados) do mês de ocorrência do sinistro, quando o capital segurado for modalidade capital global</li>
          </ul>
          
          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },
    {
        name: 'Sinistro Vida - Invalidez por Acidente (Titular/Cônjuge)', icon: '🚑', subject: 'Abertura de Sinistro Vida: Invalidez Permanente Total/Parcial por Acidente',
        body: ezzeEmail(`
          <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
          <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
          ${protocolCard('#2596be', '#f0f9ff', 'PROTOCOLO DO SINISTRO (GENESYS)', '{{protocolo}}')}
          <p style="margin-bottom: 8px;">Por favor, encaminhar a listagem de documentos abaixo no link: <a href="https://ezze-seguros.zendesk.com/hc/pt-br" target="_blank">Portal de Atendimento Ezze</a></p>
          
          <p style="margin-bottom: 4px;"><strong>Documentos do Segurado Titular:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Cópia do RG e CPF</li>
            <li>Cópia do comprovante de residência em nome do segurado titular</li>
            <li>Relatórios, exames médicos originais e radiografias originais que comprovem a invalidez</li>
            <li>Relatório médico informando a data do acidente, o percentual do déficit funcional apresentado por segmento, data de confirmação da alta médica e da reabilitação</li>
            <li>Cópia do Boletim de Ocorrência (ou descrição detalhada do acidente assinada caso não haja BO)</li>
            <li>Cópia da CNH, se acidente automobilístico e o sinistrado for o condutor</li>
            <li>Cópia do resultado do Exame Toxicológico/Dosagem Alcoólica, se realizado</li>
            <li>Cópia do Laudo de Perícia Técnica realizada no local do acidente</li>
            <li>Formulário EZZE de Autorização para Pagamento de Indenização</li>
          </ul>

          <p style="margin-bottom: 4px;"><strong>Documentos do Estipulante/Empresa:</strong></p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Cópia da Ficha de Registro de Empregado, no caso de funcionário empregado</li>
            <li>Cópia dos 3 últimos holerites imediatamente anteriores à data da ocorrência do sinistro</li>
            <li>Cópia do CAGED do mês de ocorrência do sinistro, quando o capital segurado for modalidade capital global</li>
          </ul>

          <p style="margin-bottom: 4px;"><strong>Documentos do Sinistrado (Cônjuge):</strong></p>
          <p style="margin-bottom: 4px; font-size: 13px;">Se o sinistrado for o cônjuge, além dos documentos acima, encaminhar também:</p>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Cópia de prova de União Estável (Ex: declaração feita em cartório, comprovante de residência em comum, dependência no IR, conta bancária conjunta, etc.)</li>
          </ul>

          <p>Após o recebimento, a área responsável terá até <strong>15 dias corridos</strong> para análise.</p>
        `)
    },

  // ─── BLOCO 3: RESPONSABILIDADE CIVIL E TRIUNFO (Novos) ───
  {
    name: 'Sinistro Responsabilidade Civil', icon: '💼', subject: 'Protocolo de Sinistro RC {{protocolo}} — Ezze Seguros', description: 'Abertura de sinistro de Responsabilidade Civil e demais riscos.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Olá, <strong>{{nome_cliente}}</strong>.</p>
      <p>Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
      ${protocolCard('#4338ca', '#e0e7ff', 'NÚMERO DO PROTOCOLO DE ATENDIMENTO', '{{protocolo}}')}
      <p>O analista responsável fará contato por e-mail em <strong>2 dias úteis</strong> solicitando documentação.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; color:#0f172a; font-weight:bold; font-size:14px;">Em caso de dúvidas:</p>
        <p style="margin:0; font-size:14px; color:#475569;">O contato relacionado ao sinistro deverá ser feito exclusivamente pelo e-mail:<br>
        <a href="mailto:sinistros@ezzeseguros.com.br" style="color:#4338ca; font-weight:bold;">sinistros@ezzeseguros.com.br</a></p>
        <p style="margin:10px 0 0 0; font-size:13px; color:#dc2626;"><strong>Atenção:</strong> Coloque no assunto do e-mail o CNPJ e o nome completo do titular (Empresa).</p>
      </div>
    `)
  },
  {
    name: 'Sinistro Terceiro — Triunfo', icon: '🤝', subject: 'Sinistro Terceiro (Triunfo) {{protocolo}} — Ezze Seguros', description: 'Envio de dados de terceiro envolvido com segurado Triunfo.',
    body: ezzeEmail(`
      <p style="margin-top:0; color:#0f172a;">Prezados,</p>
      <p>Segue sinistro de Terceiro envolvido com veículo segurado pela Triunfo.</p>
      ${protocolCard('#0f766e', '#ccfbf1', 'NÚMERO DO PROTOCOLO', '{{protocolo}}')}
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin-top:0; font-weight:bold; color:#0f172a; font-size:14px;">Dados do Terceiro:</p>
        <p style="margin:0; font-size:14px; color:#475569;"><em>(Por favor, inclua abaixo os dados coletados do Terceiro)</em></p>
      </div>
    `)
  }
];

async function seedTemplates() {
  try {
    const pool = await poolPromise;
    console.log('🔄 Limpando templates antigos...');
    await pool.request().query('DELETE FROM Templates');

    console.log(`📥 Inserindo ${templates.length} modelos de E-mail Ezze...`);
    for (const t of templates) {
      await pool.request()
        .input('name', sql.VarChar, t.name)
        .input('icon', sql.NVarChar, t.icon)
        .input('subject', sql.VarChar, t.subject)
        .input('description', sql.VarChar, t.description)
        .input('body', sql.NVarChar, t.body)
        .query('INSERT INTO Templates (name, icon, subject, description, body) VALUES (@name, @icon, @subject, @description, @body)');
    }
    
    console.log('✅ Todos os modelos foram importados com sucesso para o banco!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

seedTemplates();