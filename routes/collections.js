const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Collection = require('.././models/Collection');
const { Card } = require('../models/Card');

//Collection endpoints
router.get('/', async (req, res) => {
  let collections;
  try {
    collections = await Collection.find();
  } catch (error) {
    return res.status(400).send(`Database error: ${error}`);
  }

  res.send(collections);
});

router.get('/:id', async (req, res) => {
  let collection;
  try {
    collection = await Collection.findById(req.params.id);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  res.send(collection);
});

router.post('/', async (req, res) => {
  const { error } = validateCollection(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  let collection = new Collection({
    title: req.body.title,
    cards: [],
  });
  let result;
  try {
    result = await collection.save();
  } catch (error) {
    return res.status(400).send(`Database error: ${error}`);
  }
  res.send(result);
});

router.put('/:id', async (req, res) => {
  const { error } = validateCollection(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  let collection;
  try {
    collection = await Collection.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
      },
      { new: true }
    );
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  res.send(collection);
});

router.delete('/:id', async (req, res) => {
  let collection;
  try {
    collection = await Collection.findByIdAndDelete(req.params.id);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  res.send(collection);
});

//Card endpoints
router.get('/:id/cards', async (req, res) => {
  let collection;
  try {
    collection = await Collection.findById(req.params.id);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  res.send(collection.cards);
});

router.get('/:collectionId/cards/:id', async (req, res) => {
  let collection;
  try {
    collection = await Collection.findById(req.params.collectionId);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  const card = collection.cards.find((c) => c.id == req.params.id);
  if (!card)
    return res.status(404).send('The card with the given id was not found.');
  res.send(card);
});

router.post('/:id/cards', async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  let collection;
  try {
    collection = await Collection.findById(req.params.id);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  const card = new Card({
    word: req.body.word,
    definition: req.body.definition,
  });
  let cards = collection.cards;
  cards.push(card);
  try {
    collection = await Collection.findByIdAndUpdate(
      req.params.id,
      {
        cards: cards,
      },
      { new: true }
    );
  } catch (error) {
    return res
      .status(400)
      .send(`Database when attempting to update collection. Error: ${error}`);
  }

  res.send(collection);
});

router.put('/:collectionId/cards/:id', async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  let collection;
  try {
    collection = await Collection.findById(req.params.collectionId);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  let card = collection.cards.find((c) => c.id == req.params.id);
  if (!card)
    return res.status(404).send('The card with the given id was not found.');
  let cards = collection.cards;
  const indexOfCard = cards.indexOf(card);
  card = {
    word: req.body.word,
    definition: req.body.definition,
  };
  cards[indexOfCard] = card;
  try {
    collection = await Collection.findByIdAndUpdate(
      req.params.collectionId,
      {
        cards: cards,
      },
      { new: true }
    );
  } catch (error) {
    return res
      .status(400)
      .send(`Database when attempting to update collection. Error: ${error}`);
  }
  res.send(card);
});

router.delete('/:collectionId/cards/:id', async (req, res) => {
  let collection;
  try {
    collection = await Collection.findById(req.params.collectionId);
  } catch (error) {}

  if (!collection)
    return res
      .status(404)
      .send('The collection with the given id was not found.');
  let card = collection.cards.find((c) => c.id == req.params.id);
  if (!card)
    return res.status(404).send('The card with the given id was not found.');
  let cards = collection.cards;
  const indexOfCard = cards.indexOf(card);
  console.log(indexOfCard);
  cards = cards.length === 1 ? [] : cards.splice(indexOfCard, 1);
  console.log(cards);
  try {
    collection = await Collection.findByIdAndUpdate(
      req.params.collectionId,
      {
        cards: cards,
      },
      { new: true }
    );
  } catch (error) {
    return res
      .status(400)
      .send(`Database when attempting to update collection. Error: ${error}`);
  }
  res.send(collection);
});

function validateCard(card) {
  const schema = Joi.object({
    word: Joi.string().min(1).required(),
    definition: Joi.string().min(1).required(),
  });
  return schema.validate(card);
}

function validateCollection(collection) {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
  });
  return schema.validate(collection);
}

module.exports = router;
