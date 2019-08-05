import Chronicle from './modules/Chronicle';
import Supertest from './clients/Supertest';

const chronicle = new Chronicle();

function supertest(app, instance = chronicle) {
    return new Supertest(app, instance);
}

export default chronicle;
export {
    Chronicle,
    supertest
};

