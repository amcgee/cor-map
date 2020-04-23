export const trackedEntityInstanceQuery = {
    tei: {
        resource: 'trackedEntityInstances',
        id: ({id}) => id,
        params: ({ program }) => ({
            program,
            fields: [
                'attributes[attribute, displayName, value]',
                'enrollments[program]',
                'orgUnit'
            ]
        })
    }
};


export const relationshipTypesQuery = {
    rts: {
        resource: "relationshipTypes",
        params: () => ({
            paging: 'false',
            fields: ["id", "name", "bidirectional", "description", "toConstraint", "fromConstraint"],

        })
    }
};

export const trackedEntityTypes = {
    tes: {
        resource: `trackedEntityTypes`,
        params: () => ({
            paging: "false",
            fields: ["id", "displayName", "trackedEntityTypeAttributes[id,displayName]"]
        })
    }
};

export const programsQuery = {
    ps: {
        resource: `programs`,
        params: () => ({
            paging: "false",
            filter: 'programType:eq:WITH_REGISTRATION',
            fields: ["id", "displayName", "trackedEntityType[id,displayName]", "programTrackedEntityAttributes[id,displayName,trackedEntityAttribute[id,displayName]]"]
        })
    }
};

export const trackedEntityType = (te) => {
    return {
        tes: {
            resource: `trackedEntityTypes/${te}`,
            params: () => ({
                paging: "false",
                fields: ["id", "displayName", "trackedEntityTypeAttributes[id,displayName]"]
            })
        }
    }
};

export const programTEIQuery = {
    teis: {
        resource: 'trackedEntityInstances',
        params: ({program}) => ({
            ouMode: 'ACCESSIBLE',
            fields: [
                'trackedEntityInstance',
                'relationships[relationshipType,from[trackedEntityInstance[trackedEntityInstance]],to[trackedEntityInstance[trackedEntityInstance]]]',
                'attributes[attribute,value]'
            ],
            paging: 'false',
            programStatus: 'ACTIVE',
            program,
        })
    }
};