import logger from '@/logger';
import axios from 'axios';
import express, { Request, Response, Router } from 'express';
import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
});

export const twitterRouter: Router = (() => {
  const router = express.Router();

  router.get('/user_tweets', async (req: Request, res: Response) => {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    try {
      const userResponse = await twitterClient.v2.userByUsername(username);
      
      if (!userResponse.data) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const userTweets = await twitterClient.v2.userTimeline(userResponse.data.id, {
        max_results: 10,
        exclude: ['replies', 'retweets'],
      });

      res.status(200).json({ success: true, ...userTweets.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching tweets:', errorMessage);
      res.status(500).json({ success: false, error: errorMessage });
    }
  });
     

  router.get('/user_info', async (req: Request, res: Response) => {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    try {
      const user = await twitterClient.v2.userByUsername(username, {
        'user.fields': ['description', 'profile_image_url', 'public_metrics', 'verified', 'created_at', 'location']
      });

      if (!user.data) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.status(200).json({ success: true, data: user.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching user information:', errorMessage);
      res.status(500).json({ success: false, error: errorMessage });
    }
  });

  return router;
})();