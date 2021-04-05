import {getProgramsToQuery, getTEAttributes} from './templateUtils';
import {programTEIQuery, teiQueryMaxSize} from '../queries/TEIQueries';

// const isMoreRecent = (dateA, dateB) => {
//     if (!dateB) {
//         return true
//     }
//     if (!dateA) {
//         return false
//     }
//     return new Date(dateA) > new Date(dateB)
// }

const isHigherPriority = (programA, programB, programs) => {
    return programs.indexOf(programA) > programs.indexOf(programB)
}
const processTEIResponse = (teiDB, trackedEntityInstances, program, visualization, attributesToFetch) => {
    const programs = getProgramsToQuery(visualization);

    trackedEntityInstances.forEach(tei => {
        // const programEnrollmentDate = tei.enrollments.find(e => e.program === program)?.enrollmentDate
        const existingTEI = teiDB.instances[tei.trackedEntityInstance]
        if (existingTEI && isHigherPriority(existingTEI.program, program, programs)) { /*&& isMoreRecent(existingTEI.enrollments[0].enrollmentDate, programEnrollmentDate)*/
            return;
        }

        // Probably unnecessary, better to drop unrelated instances (but difficult to do at this stage)
        tei.attributes = 
            tei.attributes.reduce((acc, { attribute, value }) => {
                if (attributesToFetch.has(attribute)) {
                    acc[attribute] = value
                }
                return acc
            }, {})
        
        tei.program = program
        teiDB.instances[tei.trackedEntityInstance] = tei
    });
}

export const fetchVisualizationData = async (engine, visualization, { startDate, endDate }) => {
    const programs = getProgramsToQuery(visualization);

    const requests = programs.map(program => {
        const attributesToFetch = getTEAttributes(visualization, program);
        return engine.query(programTEIQuery, {
            variables: {
                program,
                startDate,
                endDate,
                attributes: attributesToFetch.keys()
            }
        })
    });

    // load data
    const results = await Promise.all(requests)
        
    const teiDB = {
        instances: [],
        overflown: false
    };

    results.forEach((data, i) => {
        const program = programs[i];

        // todo currently TEI queries sends back all the attributes. Bug?
        // this is just to save some RAM
        const attributesToFetch = getTEAttributes(visualization, program);

        const teis = data?.teis?.trackedEntityInstances
        // process TEI response
        if (teis) {
            processTEIResponse(teiDB, teis, program, visualization, attributesToFetch);
            if (teis.length === teiQueryMaxSize) {
                teiDB.overflown = true
            }
        } else {
            console.warn("Nothing found for program", program);
        }
    })

    return teiDB
}