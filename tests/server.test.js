const request = require('supertest');
const expect = require('expect');

var {Friends} = require('./../models/friends');
var {app} = require('./../server.js');

beforeEach((done) => {
  Friends.deleteMany({}).then(() => done());
})

describe('POST /locals',() => {
  it('should create a new friend', (done) => {
    var data = {
      name: "Qasim Ali",
      phone: "+923235168638",
      withMeAt: "Kakul",
      memorableOccasionWithMe: "We went out on a bunk together to KFC",
      currentAddress: "93 Signals Panoaqil"
    }
    request(app)
      .post('/locals')
      .send(data)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(data.name)
        // console.log(res.body)
      })
      .end((err,res) => {
        if (err) return done(err);

        Friends.find().then((docs) => {
          expect(docs.length).toBe(1);
          expect(docs[0].name).toBe(data.name);
          done();
        }). catch((e) => {
          done(e);
        });
      })
  })

  it('should give a bad request', (done) => {
    var data = {
      name: "",
      phone: "",
    }
    request(app)
      .post('/locals')
      .send(data)
      .expect(400)
      .end(done)
  })

})
