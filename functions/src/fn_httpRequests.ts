import { Collections } from "delib-npm";
import { db } from ".";
import { Query } from "firebase-admin/firestore";
const cors = require('cors')({ origin: 'http://localhost:5173' })


export const getUserOptions = async (req: any, res: any) => {
    cors(req, res, async () => {
        try {
            const userId = req.query.userId;
            const parentId = req.query.parentId;
            if (!parentId) {
                res.status(400).send({ error: "parentId is required", ok: false });
                return;
            }
            if (!userId) {
                res.status(400).send({ error: "userId is required", ok: false });
                return;
            }

            const userOptionsRef = db.collection(Collections.statements).where("creatorId", "==", userId).where("parentId", "==", parentId);
            const userOptionsDB = await userOptionsRef.get();
            const statements = userOptionsDB.docs.map((doc) => doc.data());

            res.send({ statements, ok: true });
            return;

        } catch (error: any) {
            res.status(500).send({ error: error.message, ok: false });
            return;
        }
    });
}

export const getRandomStatements = async (req: any, res: any) => {
    cors(req, res, async () => {
        try {

            const parentId = req.query.parentId;
            let limit = Number(req.query.limit) || 10 as number;
            if (limit > 50) limit = 50;

            if (!parentId) {
                res.status(400).send({ error: "parentId is required", ok: false });
                return;
            }


            const allSolutionStatementsRef = db.collection(Collections.statements);
            const q: Query = allSolutionStatementsRef.where("parentId", "==", parentId).where("statementType", "!=", "statement");
            const allSolutionStatementsDB = await q.get();
            const allSolutionStatements = allSolutionStatementsDB.docs.map((doc) => doc.data());

            //randomize the statements and return the first 10 (or limit give by the client)
            allSolutionStatements.sort(() => Math.random() - 0.5);
            const randomStatements = allSolutionStatements.splice(0, limit);

            res.send({ randomStatements, ok: true });

        } catch (error: any) {
            res.status(500).send({ error: error.message, ok: false });
            return;
        }
    });
}

export const getTopStatements = async (req: any, res: any) => {
    cors(req, res, async () => {
    try {

        const parentId = req.query.parentId;
        let limit = Number(req.query.limit) || 10 as number;
        if (limit > 50) limit = 50;

        if (!parentId) {
            res.status(400).send({ error: "parentId is required", ok: false });
            return;
        }

        const topSolutionsRef = db.collection(Collections.statements);
        const q: Query = topSolutionsRef.where("parentId", "==", parentId).where("statementType", "!=", "statement").orderBy("consensus", "desc").limit(limit);
        const topSolutionsDB = await q.get();
        const topSolutions = topSolutionsDB.docs.map((doc) => doc.data());

        res.send({ topSolutions, ok: true });
        return;

    } catch (error: any) {
        res.status(500).send({ error: error.message, ok: false });
        return;
    }
    });
}
