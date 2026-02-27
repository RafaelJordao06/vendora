# Vendora - Sistema de Controle de Compra e Venda

## Descrição

Sistema web para controle de compras, investimentos e divisão proporcional de lucros entre sócios.

## Tecnologias

- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth (JWT)
- TailwindCSS
- Cloudinary (Upload de Imagens)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:

   ```env
   # Database (PostgreSQL)
   DATABASE_URL="postgresql://user:password@localhost:5432/vendora"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="seu-segredo-aqui"

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
   CLOUDINARY_API_KEY="sua-api-key"
   CLOUDINARY_API_SECRET="sua-api-secret"
   ```

   > **Nota:** Para o upload de imagens funcionar, você deve criar um "Upload Preset" não assinado (unsigned) no Cloudinary chamado `vendora_preset`.

4. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades Implementadas

- **Autenticação:** Cadastro e Login de usuários via Email/Senha.
- **Dashboard:** Visão geral dos investimentos, vendas e lucros.
- **Nova Compra:** Cadastro de produtos com divisão de investimento e upload de imagens.
- **Registrar Venda:** Cálculo automático de lucro proporcional ao investimento de cada sócio.
- **Responsividade:** Layout adaptável para dispositivos móveis.
