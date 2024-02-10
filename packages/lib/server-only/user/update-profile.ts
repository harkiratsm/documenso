import { prisma } from '@documenso/prisma';
import { UserSecurityAuditLogType } from '@documenso/prisma/client';

import type { RequestMetadata } from '../../universal/extract-request-metadata';
import { SignatureType } from '@documenso/prisma/client';

export type UpdateProfileOptions = {
  userId: number;
  name: string;
  signature: string;
  requestMetadata?: RequestMetadata;
  signatureType: SignatureType;
};

export const updateProfile = async ({
  userId,
  name,
  signature,
  signatureType,
  requestMetadata
}: UpdateProfileOptions) => {
  // Existence check
  await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  return await prisma.$transaction(async (tx) => {
    await tx.userSecurityAuditLog.create({
      data: {
        userId,
        type: UserSecurityAuditLogType.ACCOUNT_PROFILE_UPDATE,
        userAgent: requestMetadata?.userAgent,
        ipAddress: requestMetadata?.ipAddress,
      },
    });

    return await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        signature,
        signatureType,
      },
    });
  });
};
