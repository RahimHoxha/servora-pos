import { Repository } from "typeorm";
import { Company } from "./company.entity";

export function generateCompanyCodeCandidate(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function generateUniqueCompanyCode(
  repo: Repository<Company>,
  maxAttempts = 50
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCompanyCodeCandidate();
    const existing = await repo.findOne({ where: { code } });
    if (!existing) {
      return code;
    }
  }

  throw new Error("Could not generate a unique company code.");
}
