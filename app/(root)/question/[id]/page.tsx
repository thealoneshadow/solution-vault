import { getQuestionById } from "@/lib/actions/Question.action";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { getTimeStamp, getFormattedNumber } from "@/lib/utils";
import Metric from "@/components/shared/Metric";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import Answers from "@/components/Forms/Answers";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/User.action";
import { redirect } from "next/navigation";
import AllAnswers from "@/components/shared/AllAnswers";
import Votes from "@/components/shared/Votes";
import { URLProps } from "@/types";

const page = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionById({ questionId: params.id });
  const { userId: clerkId } = auth();

  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  } else {
    return redirect("/sign-in");
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${result.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={result.author.picture}
              alt="profile"
              className="rounded-full"
              width={22}
              height={22}
            />
            <p className="paragraph-semibold text-dark300_light700">
              {result.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              type="Question"
              itemId={JSON.stringify(result._id)}
              userId={JSON.stringify(mongoUser._id)}
              upvotes={result.upvotes.length}
              hasupVoted={result.upvotes.includes(mongoUser._id)}
              downvotes={result.downvotes.length}
              hasdownVoted={result.downvotes.includes(mongoUser._id)}
              hasSaved={mongoUser?.saved.includes(result._id)}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {result.title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(result.createdAt)}`}
          title=" Asked"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="Message"
          value={getFormattedNumber(result.answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="Eye"
          value={getFormattedNumber(result.views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      <ParseHTML data={result.content} />

      <div className="mt-8 flex flex-row items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag: any) => (
            <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
          ))}
        </div>
      </div>
      <AllAnswers
        questionId={result._id}
        userId={mongoUser._id}
        totalAnswers={result.answers.length}
      />
      <Answers
        question={result.content}
        questionId={JSON.stringify(result._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  );
};

export default page;
