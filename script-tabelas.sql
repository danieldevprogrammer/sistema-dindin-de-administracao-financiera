-- Script para criar o banco de dados dindin
CREATE DATABASE dindin;

-- Criar tabela usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY NoT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Criar tabela categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL
);


-- Criar tabela transacoes
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor INTEGER(10,2) NOT NULL,
    data DATE NOT NULL,
    categoria_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
