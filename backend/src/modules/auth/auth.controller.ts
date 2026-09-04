import type { Request, Response } from "express";
import { AuthService, CredenciaisInvalidasError } from "./auth.service.js";
import { validarCredenciaisLogin } from "./auth.validation.js";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const validacao = validarCredenciaisLogin(req.body);

    if (!validacao.ok) {
      res.status(400).json({ erro: validacao.mensagem });
      return;
    }

    try {
      const resultado = await this.service.login(validacao.dados);
      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof CredenciaisInvalidasError) {
        res.status(401).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };
}
