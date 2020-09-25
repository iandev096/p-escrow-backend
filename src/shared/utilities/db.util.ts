import { Repository } from "typeorm";
import { IUserEntity } from "../interfaces/db.interface";
import { ForbiddenException } from "@nestjs/common";
import { LogAction } from "../log/log.enum";
import { Log } from "../log/log.entity";

export const createLogHelper = (userId: string, action: LogAction, description: string) => {
    const log = new Log();
    log.userId = userId;
    log.action = action;
    log.description = description;
    return log;
}

export async function getEntitiesByIds<T extends IUserEntity>(
    entityIds: string[],
    repository: Repository<T>,
    relations?: string[]
) {
    const whereQ = entityIds.map(entityId => ({ id: entityId }));

    const entities = await repository.find({
        where: whereQ,
        relations: relations
    });

    return entities;
}

export async function authorizeUserEntitiesActions<T extends IUserEntity>(
    entityIds: string[],
    userId: string,
    repository: Repository<T>,
    operationDenyMessasge?: string
) {
    const entities = await getEntitiesByIds<T>(entityIds, repository);
    entities.forEach(async (entity) => {
        if (entity.userId !== userId) {
            throw new ForbiddenException(operationDenyMessasge);
        }
    })
    return entities;
}

export async function authorizeUserEntityAction<T extends IUserEntity>(
    entityId: string,
    userId: string,
    repository: Repository<T>,
    operationDenyMessasge?: string
) {
    const entity = await repository.findOne(entityId);
    
    if (entity.userId !== userId) {
        throw new ForbiddenException(operationDenyMessasge);
    }

    return entity;
}
